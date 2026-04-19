import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  CheckCircle,
  Loader2,
  MapPin,
  FileText,
  Database,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CSVRecord {
  timestamp: string;
  zone_id: string;
  zone_name: string;
  crowd_density: string;
  avg_wait_time_sec: string;
  entry_flow_rate_per_min: string;
  exit_flow_rate_per_min: string;
  incident_flag: string;
  staff_required: string;
  temperature_c: string;
  latitude?: string;
  longitude?: string;
  location_name?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface LocationOverride {
  latitude: string;
  longitude: string;
  locationName: string;
  address: string;
  city: string;
  country: string;
}

interface ImportStats {
  imported: number;
  zones: number;
  facilities: number;
  totalRows: number;
  skipped: number;
  chunksProcessed: number;
  totalChunks: number;
}

const CHUNK_SIZE = 5000;
const MIN_ROWS = 100_000;
const MAX_ROWS = 500_000;

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [previewRows, setPreviewRows] = useState<CSVRecord[]>([]);
  const [totalRows, setTotalRows] = useState<number | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationOverride, setLocationOverride] = useState<LocationOverride>({
    latitude: "",
    longitude: "",
    locationName: "",
    address: "",
    city: "",
    country: "",
  });
  const [hasLocationColumns, setHasLocationColumns] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef(false);

  const importMutation = trpc.dataImport.importCrowdDensityBatch.useMutation();

  const analyzeCSV = useCallback((content: string) => {
    const lines = content.split("\n").filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    setCsvHeaders(headers);

    const locationCols = ["latitude", "longitude", "location_name", "address", "city", "country"];
    const detected = locationCols.some((col) => headers.includes(col));
    setHasLocationColumns(detected);

    const rowCount = lines.length - 1;
    setTotalRows(rowCount);

    const preview: CSVRecord[] = [];
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(",");
      const record: any = {};
      headers.forEach((h, idx) => { record[h] = values[idx]?.trim() || ""; });
      preview.push(record);
    }
    setPreviewRows(preview);
    return rowCount;
  }, []);

  const handleFileChange = useCallback(
    (selectedFile: File) => {
      if (!selectedFile.name.endsWith(".csv")) { toast.error("Please select a CSV file"); return; }
      setFile(selectedFile);
      setImportResult(null);
      setProgress(0);
      setProgressLabel("");

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const count = analyzeCSV(content);
        if (count < MIN_ROWS) {
          toast.warning(`Dataset has ${count.toLocaleString()} rows. For best results, use ${MIN_ROWS.toLocaleString()}–${MAX_ROWS.toLocaleString()} rows.`);
        } else if (count > MAX_ROWS) {
          toast.error(`Dataset exceeds the max of ${MAX_ROWS.toLocaleString()} rows.`);
          setFile(null);
        } else {
          toast.success(`Detected ${count.toLocaleString()} rows — ready to import!`);
        }
      };
      reader.readAsText(selectedFile.slice(0, 2 * 1024 * 1024));
    },
    [analyzeCSV]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileChange(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileChange(f);
  };

  const parseFullCSV = (content: string): CSVRecord[] => {
    const lines = content.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const records: CSVRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(",");
      const record: any = {};
      headers.forEach((h, idx) => { record[h] = values[idx]?.trim() || ""; });
      records.push(record);
    }
    return records;
  };

  const buildTransformed = (r: CSVRecord, locOverride: LocationOverride | null) => ({
    zoneCode: r.zone_id,
    zoneName: r.zone_name,
    crowdDensity: parseFloat(r.crowd_density) || 0,
    avgWaitTimeSec: parseInt(r.avg_wait_time_sec) || 0,
    entryFlowPerMin: parseInt(r.entry_flow_rate_per_min) || 0,
    exitFlowPerMin: parseInt(r.exit_flow_rate_per_min) || 0,
    incidentFlag: parseInt(r.incident_flag) || 0,
    staffRequired: parseInt(r.staff_required) || 0,
    temperatureCelsius: parseFloat(r.temperature_c) || 0,
    timestamp: r.timestamp,
    latitude: r.latitude ? parseFloat(r.latitude) : locOverride?.latitude ? parseFloat(locOverride.latitude) : undefined,
    longitude: r.longitude ? parseFloat(r.longitude) : locOverride?.longitude ? parseFloat(locOverride.longitude) : undefined,
    locationName: r.location_name || locOverride?.locationName || undefined,
    address: r.address || locOverride?.address || undefined,
    city: r.city || locOverride?.city || undefined,
    country: r.country || locOverride?.country || undefined,
  });

  const handleImport = async () => {
    if (!file) { toast.error("Please select a file first"); return; }
    abortRef.current = false;
    setIsLoading(true);
    setProgress(0);
    setProgressLabel("Reading file…");

    try {
      const content = await file.text();
      const records = parseFullCSV(content);
      if (records.length === 0) { toast.error("CSV file is empty"); setIsLoading(false); return; }

      const locOverride = locationOverride.latitude || locationOverride.locationName ? locationOverride : null;
      const totalChunks = Math.ceil(records.length / CHUNK_SIZE);
      let totalImported = 0, totalZones = 0, totalFacilities = 0, totalSkipped = 0;

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        if (abortRef.current) { toast.info("Import cancelled"); break; }
        const start = chunkIdx * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, records.length);
        setProgressLabel(`Processing chunk ${chunkIdx + 1} / ${totalChunks} (rows ${start.toLocaleString()}–${end.toLocaleString()})…`);
        setProgress(Math.round((chunkIdx / totalChunks) * 100));

        try {
          const result = await importMutation.mutateAsync({
            venueId: 1,
            records: records.slice(start, end).map((r) => buildTransformed(r, locOverride)),
          });
          totalImported += result.imported ?? (end - start);
          totalZones = Math.max(totalZones, result.zones ?? 0);
          totalFacilities = Math.max(totalFacilities, result.facilities ?? 0);
        } catch (chunkErr: any) {
          totalSkipped += end - start;
          console.warn(`Chunk ${chunkIdx + 1} failed:`, chunkErr.message);
        }
        await new Promise((r) => setTimeout(r, 0));
      }

      setProgress(100);
      setProgressLabel("Done!");
      setImportResult({ imported: totalImported, zones: totalZones, facilities: totalFacilities, totalRows: records.length, skipped: totalSkipped, chunksProcessed: totalChunks, totalChunks });
      toast.success(`Imported ${totalImported.toLocaleString()} records across ${totalZones} zones!`);
      setFile(null); setPreviewRows([]); setTotalRows(null);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  const rowsInRange = totalRows !== null && totalRows >= MIN_ROWS && totalRows <= MAX_ROWS;

  return (
    <div className="min-h-screen bg-background pt-8 px-4 pb-24">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Database size={28} className="text-accent" />
            <h1 className="headline">Data Import</h1>
          </div>
          <p className="subheading text-muted-foreground">
            Upload large venue datasets (100K–500K rows) with optional location data
          </p>
        </div>

        {/* Drop Zone */}
        <Card
          className={`p-10 border-2 border-dashed transition-all duration-200 ${dragOver ? "border-accent bg-accent/5 scale-[1.01]" : file ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-border hover:border-accent/60"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            {file ? (
              <>
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <FileText size={28} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                    {totalRows !== null && (
                      <span className={`ml-3 font-semibold ${rowsInRange ? "text-green-600" : "text-yellow-600"}`}>
                        {totalRows.toLocaleString()} rows detected
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={() => { setFile(null); setPreviewRows([]); setTotalRows(null); setImportResult(null); }} className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 text-sm">
                  <X size={14} /> Remove file
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Upload size={32} className="text-accent" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Drag & drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports datasets from <span className="font-semibold text-foreground">100,000 to 500,000 rows</span>
                  </p>
                </div>
                <input type="file" accept=".csv" onChange={onInputChange} className="hidden" id="csv-input" />
                <label htmlFor="csv-input">
                  <Button asChild variant="outline" className="cursor-pointer mt-2"><span>Browse Files</span></Button>
                </label>
              </>
            )}
          </div>
        </Card>

        {/* Row count validation bar */}
        {totalRows !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100K (min)</span>
              <span className={`font-semibold ${rowsInRange ? "text-green-600" : "text-yellow-600"}`}>{totalRows.toLocaleString()} rows</span>
              <span>500K (max)</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${rowsInRange ? "bg-green-500" : "bg-yellow-500"}`}
                style={{ width: `${Math.min(100, Math.max(2, ((totalRows - MIN_ROWS) / (MAX_ROWS - MIN_ROWS)) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Data Preview */}
        {previewRows.length > 0 && (
          <Card className="p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-accent" />
              <p className="text-sm font-semibold">Preview (first 5 rows)</p>
              {hasLocationColumns && (
                <span className="ml-auto text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin size={11} /> Location columns detected
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr className="border-b border-border">
                    {csvHeaders.slice(0, 8).map((h) => (
                      <th key={h} className="py-1 pr-3 text-left font-mono text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                    {csvHeaders.length > 8 && <th className="py-1 pr-3 text-left text-muted-foreground">+{csvHeaders.length - 8} more</th>}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      {csvHeaders.slice(0, 8).map((h) => (
                        <td key={h} className="py-1 pr-3 font-mono truncate max-w-[120px]">{(row as any)[h] ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Location Section */}
        {file && (
          <Card className="overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors" onClick={() => setShowLocationForm((v) => !v)}>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                <div className="text-left">
                  <p className="font-semibold text-sm">{hasLocationColumns ? "Location Data Detected" : "Add Location Data"}</p>
                  <p className="text-xs text-muted-foreground">{hasLocationColumns ? "Your CSV has location columns — optionally set manual overrides" : "Attach venue coordinates and address to this dataset"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(locationOverride.latitude || locationOverride.locationName) && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Set</span>
                )}
                {showLocationForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {showLocationForm && (
              <div className="border-t border-border p-4 grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Location Name</label>
                  <input type="text" placeholder="e.g. Wankhede Stadium" value={locationOverride.locationName} onChange={(e) => setLocationOverride((v) => ({ ...v, locationName: e.target.value }))} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Latitude</label>
                  <input type="number" step="any" placeholder="e.g. 18.9388" value={locationOverride.latitude} onChange={(e) => setLocationOverride((v) => ({ ...v, latitude: e.target.value }))} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Longitude</label>
                  <input type="number" step="any" placeholder="e.g. 72.8258" value={locationOverride.longitude} onChange={(e) => setLocationOverride((v) => ({ ...v, longitude: e.target.value }))} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                  <input type="text" placeholder="e.g. D Rd, Churchgate" value={locationOverride.address} onChange={(e) => setLocationOverride((v) => ({ ...v, address: e.target.value }))} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                  <input type="text" placeholder="e.g. Mumbai" value={locationOverride.city} onChange={(e) => setLocationOverride((v) => ({ ...v, city: e.target.value }))} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                  <input type="text" placeholder="e.g. India" value={locationOverride.country} onChange={(e) => setLocationOverride((v) => ({ ...v, country: e.target.value }))} className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-accent/50" />
                </div>
                {!hasLocationColumns && (
                  <p className="col-span-2 text-xs text-muted-foreground bg-secondary rounded-md px-3 py-2">
                    💡 Tip: Add <span className="font-mono">latitude</span>, <span className="font-mono">longitude</span>, <span className="font-mono">location_name</span>, <span className="font-mono">address</span>, <span className="font-mono">city</span>, <span className="font-mono">country</span> columns in your CSV for per-row location data.
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Progress */}
        {isLoading && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-accent" />
                <p className="text-sm font-semibold">{progressLabel}</p>
              </div>
              <button onClick={() => { abortRef.current = true; }} className="text-xs text-destructive hover:underline">Cancel</button>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-right">{progress}%</p>
          </Card>
        )}

        {/* Import Button */}
        {file && !isLoading && (
          <Button onClick={handleImport} disabled={!rowsInRange} className="w-full py-6 text-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50">
            <Database size={20} className="mr-2" />
            Import {totalRows ? totalRows.toLocaleString() : ""} Records
          </Button>
        )}

        {/* Result */}
        {importResult && (
          <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <div className="flex gap-4">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="w-full">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Import Complete!</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Records Imported", value: importResult.imported.toLocaleString(), icon: "📊" },
                    { label: "Total Rows", value: importResult.totalRows.toLocaleString(), icon: "📁" },
                    { label: "Zones Created", value: importResult.zones.toString(), icon: "🗺️" },
                    { label: "Facilities Created", value: importResult.facilities.toString(), icon: "🏪" },
                    { label: "Chunks Processed", value: `${importResult.chunksProcessed}/${importResult.totalChunks}`, icon: "⚡" },
                    { label: "Rows Skipped", value: importResult.skipped.toLocaleString(), icon: "⚠️" },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white dark:bg-green-900/30 rounded-lg p-3">
                      <p className="text-xs text-green-700 dark:text-green-400 mb-1">{icon} {label}</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Format Reference */}
        <Card className="p-6 bg-secondary">
          <h3 className="text-base font-semibold mb-4">CSV Format Reference</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Required Columns</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[["timestamp","Date/time of record"],["zone_id","Unique zone ID (e.g. Z01)"],["zone_name","Human-readable zone name"],["crowd_density","Density level 0–1"],["avg_wait_time_sec","Avg wait in seconds"],["entry_flow_rate_per_min","People entering/min"],["exit_flow_rate_per_min","People exiting/min"],["incident_flag","Incident indicator (0/1)"],["staff_required","Staff count needed"],["temperature_c","Temperature (°C)"]].map(([col, desc]) => (
                  <div key={col} className="flex gap-2"><span className="font-mono text-xs text-accent shrink-0">{col}</span><span className="text-xs text-muted-foreground">{desc}</span></div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><MapPin size={12} /> Optional Location Columns</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[["latitude","Decimal latitude"],["longitude","Decimal longitude"],["location_name","Venue or zone name"],["address","Street address"],["city","City name"],["country","Country name"]].map(([col, desc]) => (
                  <div key={col} className="flex gap-2"><span className="font-mono text-xs text-blue-500 shrink-0">{col}</span><span className="text-xs text-muted-foreground">{desc}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-background rounded-md p-3 text-xs text-muted-foreground border border-border">
              <p className="font-semibold mb-1">Dataset Size Requirements</p>
              <p>Minimum: <span className="font-mono text-foreground">100,000</span> rows &nbsp;|&nbsp; Maximum: <span className="font-mono text-foreground">500,000</span> rows</p>
              <p className="mt-1">Large files are processed in chunks of {CHUNK_SIZE.toLocaleString()} rows to prevent browser timeouts.</p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

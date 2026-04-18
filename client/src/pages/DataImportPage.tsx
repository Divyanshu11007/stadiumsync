import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
}

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const importMutation = trpc.dataImport.importCrowdDensityBatch.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const parseCSV = (content: string): CSVRecord[] => {
    const lines = content.split("\n");
    const headers = lines[0].split(",");
    const records: CSVRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",");
      const record: any = {};

      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim() || "";
      });

      records.push(record);
    }

    return records;
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsLoading(true);
    try {
      const content = await file.text();
      const records = parseCSV(content);

      if (records.length === 0) {
        toast.error("CSV file is empty");
        setIsLoading(false);
        return;
      }

      // Transform records to match API schema
      const transformedRecords = records.map((r) => ({
        zoneCode: r.zone_id,
        zoneName: r.zone_name,
        crowdDensity: parseFloat(r.crowd_density),
        avgWaitTimeSec: parseInt(r.avg_wait_time_sec),
        entryFlowPerMin: parseInt(r.entry_flow_rate_per_min),
        exitFlowPerMin: parseInt(r.exit_flow_rate_per_min),
        incidentFlag: parseInt(r.incident_flag),
        staffRequired: parseInt(r.staff_required),
        temperatureCelsius: parseFloat(r.temperature_c),
        timestamp: r.timestamp,
      }));

      // Call the import mutation
      const result = await importMutation.mutateAsync({
        venueId: 1, // Default venue ID
        records: transformedRecords,
      });

      setImportResult(result);
      toast.success(
        `Successfully imported ${result.imported} records from ${result.zones} zones!`
      );
      setFile(null);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Data Import</h1>
          <p className="subheading">Upload real-time venue data from CSV</p>
        </div>

        {/* Upload Card */}
        <Card className="p-8 mb-6 border-2 border-dashed border-border hover:border-accent transition-colors">
          <div className="flex flex-col items-center justify-center gap-4">
            <Upload size={48} className="text-muted-foreground" />

            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Upload CSV File</p>
              <p className="text-sm text-muted-foreground mb-4">
                Select a CSV file with crowd density and wait time data
              </p>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-input"
            />

            <label htmlFor="csv-input">
              <Button asChild variant="outline" className="cursor-pointer">
                <span>Choose File</span>
              </Button>
            </label>

            {file && (
              <div className="mt-4 p-4 bg-secondary rounded-lg w-full">
                <p className="text-sm font-semibold">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Import Button */}
        {file && (
          <Button
            onClick={handleImport}
            disabled={isLoading}
            className="w-full mb-6 bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Importing...
              </>
            ) : (
              "Import Data"
            )}
          </Button>
        )}

        {/* Result Card */}
        {importResult && (
          <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="flex gap-4">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Import Successful!
                </h3>
                <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                  <p>📊 Records Imported: {importResult.imported}</p>
                  <p>🗺️ Zones Created: {importResult.zones}</p>
                  <p>🏪 Facilities Created: {importResult.facilities}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-secondary mt-8">
          <h3 className="text-lg font-semibold mb-4">CSV Format Requirements</h3>
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Your CSV must include these columns:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="font-mono">timestamp</span> - Date/time of the record
              </li>
              <li>
                <span className="font-mono">zone_id</span> - Unique zone identifier (e.g., Z01)
              </li>
              <li>
                <span className="font-mono">zone_name</span> - Human-readable zone name
              </li>
              <li>
                <span className="font-mono">crowd_density</span> - Density level (0-1)
              </li>
              <li>
                <span className="font-mono">avg_wait_time_sec</span> - Average wait in seconds
              </li>
              <li>
                <span className="font-mono">entry_flow_rate_per_min</span> - People entering per minute
              </li>
              <li>
                <span className="font-mono">exit_flow_rate_per_min</span> - People exiting per minute
              </li>
              <li>
                <span className="font-mono">incident_flag</span> - Incident indicator (0 or 1)
              </li>
              <li>
                <span className="font-mono">staff_required</span> - Staff needed
              </li>
              <li>
                <span className="font-mono">temperature_c</span> - Temperature in Celsius
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

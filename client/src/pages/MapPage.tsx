import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZoneCard } from "@/components/ZoneCard";
import { MapPin } from "lucide-react";

export default function MapPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Venue Map</h1>
          <p className="subheading">Navigate with real-time crowd density</p>
        </div>

        {/* Map Container */}
        <Card className="bg-card border border-border rounded-lg overflow-hidden mb-6 aspect-square flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm font-sans">Interactive venue map coming soon</p>
            <p className="text-xs font-sans text-muted-foreground mt-2">
              Real-time crowd density overlays and navigation
            </p>
          </div>
        </Card>

        {/* Zone Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Zones & Facilities</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Section 101", density: "low" as const },
              { name: "Section 102", density: "medium" as const },
              { name: "Concourse A", density: "low" as const },
              { name: "Concourse B", density: "high" as const },
            ].map((zone) => (
              <ZoneCard
                key={zone.name}
                name={zone.name}
                density={zone.density}
                estimatedCount={Math.floor(Math.random() * 500) + 100}
              />
            ))}
          </div>
        </div>

        {/* Facilities Legend */}
        <div className="mt-8 p-4 bg-secondary rounded-lg">
          <h4 className="text-sm font-sans font-semibold mb-3">Facilities</h4>
          <div className="space-y-2 text-xs font-sans">
            <p>🍔 Concession Stands</p>
            <p>🚻 Restrooms</p>
            <p>🏥 First Aid Stations</p>
            <p>ℹ️ Information Desks</p>
          </div>
        </div>
      </div>
    </div>
  );
}

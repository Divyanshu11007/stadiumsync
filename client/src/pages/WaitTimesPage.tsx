import { Card } from "@/components/ui/card";
import { WaitTimeIndicator } from "@/components/WaitTimeIndicator";
import { Clock } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  type: string;
  waitTime: number;
  status: "low" | "medium" | "high";
}

export default function WaitTimesPage() {
  // Mock data - will be replaced with real-time data from tRPC
  const facilities: Facility[] = [
    { id: "1", name: "North Concourse - Pizza", type: "concession", waitTime: 5, status: "low" },
    { id: "2", name: "South Concourse - Burgers", type: "concession", waitTime: 15, status: "medium" },
    { id: "3", name: "East Concourse - Hot Dogs", type: "concession", waitTime: 25, status: "high" },
    { id: "4", name: "Level 1 Restrooms", type: "restroom", waitTime: 3, status: "low" },
    { id: "5", name: "Level 2 Restrooms", type: "restroom", waitTime: 10, status: "medium" },
    { id: "6", name: "Level 3 Restrooms", type: "restroom", waitTime: 20, status: "high" },
    { id: "7", name: "Main Entrance", type: "entrance", waitTime: 2, status: "low" },
    { id: "8", name: "East Gate", type: "entrance", waitTime: 8, status: "medium" },
  ];

  const getStatusColor = (status: "low" | "medium" | "high") => {
    switch (status) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    }
  };

  const getStatusLabel = (status: "low" | "medium" | "high") => {
    switch (status) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
    }
  };

  const groupedByType = facilities.reduce(
    (acc, facility) => {
      if (!acc[facility.type]) acc[facility.type] = [];
      acc[facility.type].push(facility);
      return acc;
    },
    {} as Record<string, Facility[]>
  );

  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Wait Times</h1>
          <p className="subheading">Real-time facility wait times</p>
        </div>

        {/* Concessions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">🍔 Concessions</h3>
          <div className="space-y-3">
            {groupedByType.concession?.map((facility) => (
              <WaitTimeIndicator
                key={facility.id}
                facilityName={facility.name}
                waitMinutes={facility.waitTime}
                status={facility.status}
              />
            ))}
          </div>
        </div>

        {/* Restrooms */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">🚻 Restrooms</h3>
          <div className="space-y-3">
            {groupedByType.restroom?.map((facility) => (
              <WaitTimeIndicator
                key={facility.id}
                facilityName={facility.name}
                waitMinutes={facility.waitTime}
                status={facility.status}
              />
            ))}
          </div>
        </div>

        {/* Entrances */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">🚪 Entrances</h3>
          <div className="space-y-3">
            {groupedByType.entrance?.map((facility) => (
              <WaitTimeIndicator
                key={facility.id}
                facilityName={facility.name}
                waitMinutes={facility.waitTime}
                status={facility.status}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <Card className="p-4 bg-secondary mb-8">
          <p className="text-xs font-sans font-semibold text-muted-foreground mb-3">
            STATUS INDICATORS
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs font-sans">Low (0-10 min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs font-sans">Medium (11-20 min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs font-sans">High (20+ min)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

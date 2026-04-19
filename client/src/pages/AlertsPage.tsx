import { Card } from "@/components/ui/card";
import { AlertCard } from "@/components/AlertCard";
import { Bell } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  content: string;
  type: "announcement" | "gate_change" | "emergency" | "special_offer" | "info";
  priority: "low" | "medium" | "high";
  timestamp: string;
}

export default function AlertsPage() {
  // Mock data - will be replaced with real-time data from tRPC
  const alerts: Alert[] = [
    {
      id: "1",
      title: "Gate Change",
      content: "East Gate 3 is now closed. Please use East Gate 1 or 2.",
      type: "gate_change",
      priority: "high",
      timestamp: "5 min ago",
    },
    {
      id: "2",
      title: "Special Offer",
      content: "20% off concessions at North Stand until 8 PM!",
      type: "special_offer",
      priority: "medium",
      timestamp: "15 min ago",
    },
    {
      id: "3",
      title: "Restroom Update",
      content: "Level 2 restrooms temporarily closed for maintenance. Use Level 1 or 3.",
      type: "info",
      priority: "medium",
      timestamp: "22 min ago",
    },
    {
      id: "4",
      title: "Parking Notice",
      content: "Lot C is now full. Please use Lot A or B.",
      type: "announcement",
      priority: "low",
      timestamp: "35 min ago",
    },
    {
      id: "5",
      title: "Weather Alert",
      content: "Light rain expected in the next hour. Bring an umbrella!",
      type: "info",
      priority: "low",
      timestamp: "45 min ago",
    },
  ];



  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Alerts & Announcements</h1>
          <p className="subheading">Stay informed with real-time updates</p>
        </div>

        {/* Active Alerts */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              title={alert.title}
              content={alert.content}
              type={alert.type}
              priority={alert.priority}
              timestamp={alert.timestamp}
            />
          ))}
        </div>

        {/* Notification Settings */}
        <Card className="mt-8 p-6 bg-secondary">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-sans">Emergency alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-sans">Gate changes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-sans">Special offers</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-sans">General announcements</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}

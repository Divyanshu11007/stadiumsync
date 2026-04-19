import { Card } from "@/components/ui/card";
import { AlertTriangle, Zap, Bell, Info } from "lucide-react";

interface AlertCardProps {
  title: string;
  content: string;
  type: "announcement" | "gate_change" | "emergency" | "special_offer" | "info";
  priority: "low" | "medium" | "high";
  timestamp: string;
}

export function AlertCard({
  title,
  content,
  type,
  priority,
  timestamp,
}: AlertCardProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle size={24} className="text-red-600" />;
      case "gate_change":
        return <Zap size={24} className="text-amber-600" />;
      case "special_offer":
        return <Bell size={24} className="text-blue-600" />;
      default:
        return <Info size={24} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    }
  };

  const getPriorityLabel = (priority: "low" | "medium" | "high") => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getBorderColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "border-l-blue-500";
      case "medium":
        return "border-l-amber-600";
      case "high":
        return "border-l-red-600";
    }
  };

  return (
    <Card
      className={`p-4 border-l-4 ${getBorderColor(priority)}`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 pt-1">
          {getAlertIcon(type)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-sm font-sans text-foreground mt-1">
                {content}
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs font-semibold font-sans whitespace-nowrap ${getPriorityColor(
                priority
              )}`}
            >
              {getPriorityLabel(priority)}
            </div>
          </div>
          <p className="text-xs font-sans text-muted-foreground mt-2">
            {timestamp}
          </p>
        </div>
      </div>
    </Card>
  );
}

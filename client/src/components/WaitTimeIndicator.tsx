import { Card } from "@/components/ui/card";

interface WaitTimeIndicatorProps {
  facilityName: string;
  waitMinutes: number;
  status: "low" | "medium" | "high";
  facilityType?: string;
}

export function WaitTimeIndicator({
  facilityName,
  waitMinutes,
  status,
  facilityType,
}: WaitTimeIndicatorProps) {
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

  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <p className="font-semibold text-sm">{facilityName}</p>
        {facilityType && (
          <p className="text-xs font-sans text-muted-foreground mt-1">
            {facilityType}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-2xl font-bold">{waitMinutes}</p>
          <p className="text-xs font-sans text-muted-foreground">min</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold font-sans ${getStatusColor(
            status
          )}`}
        >
          {getStatusLabel(status)}
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";

interface ZoneCardProps {
  name: string;
  density: "low" | "medium" | "high";
  estimatedCount?: number;
  onClick?: () => void;
}

export function ZoneCard({
  name,
  density,
  estimatedCount,
  onClick,
}: ZoneCardProps) {
  const getDensityColor = (density: "low" | "medium" | "high") => {
    switch (density) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    }
  };

  const getDensityLabel = (density: "low" | "medium" | "high") => {
    switch (density) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
    }
  };

  const getDotColor = (density: "low" | "medium" | "high") => {
    switch (density) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-amber-500";
      case "high":
        return "bg-red-500";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 cursor-pointer transition-smooth hover:bg-secondary ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{name}</p>
          {estimatedCount !== undefined && (
            <p className="text-xs font-sans text-muted-foreground mt-1">
              ~{estimatedCount} people
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getDotColor(density)}`}></div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold font-sans ${getDensityColor(
              density
            )}`}
          >
            {getDensityLabel(density)}
          </div>
        </div>
      </div>
    </Card>
  );
}

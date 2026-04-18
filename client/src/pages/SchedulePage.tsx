import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface EventMoment {
  id: string;
  time: string;
  title: string;
  description: string;
  type: "goal" | "score" | "timeout" | "period_end" | "announcement";
}

export default function SchedulePage() {
  // Mock data - will be replaced with real-time data from tRPC
  const currentEvent = {
    title: "Championship Game",
    status: "live",
    startTime: "7:00 PM",
    score: "3 - 2",
    period: "3rd Period",
  };

  const moments: EventMoment[] = [
    {
      id: "1",
      time: "7:45 PM",
      title: "Goal!",
      description: "Team A scores - Assist by Player #10",
      type: "goal",
    },
    {
      id: "2",
      time: "7:32 PM",
      title: "Goal!",
      description: "Team B scores - Power play goal",
      type: "goal",
    },
    {
      id: "3",
      time: "7:15 PM",
      title: "Timeout",
      description: "Team A calls timeout",
      type: "timeout",
    },
    {
      id: "4",
      time: "6:58 PM",
      title: "Goal!",
      description: "Team A scores - Even strength",
      type: "goal",
    },
    {
      id: "5",
      time: "6:30 PM",
      title: "Period End",
      description: "End of 2nd Period",
      type: "period_end",
    },
  ];

  const upcomingEvents = [
    { time: "8:30 PM", title: "Post-Game Press Conference" },
    { time: "9:00 PM", title: "Venue Closing" },
  ];

  const getMomentIcon = (type: string) => {
    switch (type) {
      case "goal":
        return "⚽";
      case "score":
        return "📊";
      case "timeout":
        return "⏸️";
      case "period_end":
        return "🔔";
      case "announcement":
        return "📢";
      default:
        return "📌";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Event Schedule</h1>
          <p className="subheading">Live updates and timeline</p>
        </div>

        {/* Current Event */}
        <Card className="p-6 mb-8 bg-accent text-accent-foreground">
          <p className="text-xs font-sans font-semibold tracking-widest uppercase mb-2">
            LIVE NOW
          </p>
          <h2 className="text-3xl font-bold mb-4">{currentEvent.title}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-sans text-accent-foreground/80">Score</p>
              <p className="text-2xl font-bold">{currentEvent.score}</p>
            </div>
            <div>
              <p className="text-xs font-sans text-accent-foreground/80">Period</p>
              <p className="text-2xl font-bold">{currentEvent.period}</p>
            </div>
            <div>
              <p className="text-xs font-sans text-accent-foreground/80">Start Time</p>
              <p className="text-2xl font-bold">{currentEvent.startTime}</p>
            </div>
          </div>
        </Card>

        {/* Event Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Event Moments</h3>
          <div className="space-y-3">
            {moments.map((moment, index) => (
              <Card key={moment.id} className="p-4">
                <div className="flex gap-4">
                  <div className="text-2xl">{getMomentIcon(moment.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{moment.title}</p>
                        <p className="text-xs font-sans text-muted-foreground mt-1">
                          {moment.description}
                        </p>
                      </div>
                      <p className="text-xs font-sans font-semibold text-muted-foreground">
                        {moment.time}
                      </p>
                    </div>
                  </div>
                </div>
                {index < moments.length - 1 && (
                  <div className="ml-6 mt-3 h-4 border-l border-border"></div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <Card key={event.time} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-muted-foreground" />
                  <p className="font-semibold text-sm">{event.title}</p>
                </div>
                <p className="text-xs font-sans font-semibold text-muted-foreground">
                  {event.time}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-4 bg-secondary mb-8">
          <p className="text-xs font-sans font-semibold text-muted-foreground mb-2">
            💡 TIP
          </p>
          <p className="text-sm font-sans text-foreground">
            Enable notifications to get real-time alerts for important moments and venue announcements.
          </p>
        </Card>
      </div>
    </div>
  );
}

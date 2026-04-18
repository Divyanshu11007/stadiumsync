import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("wait-times");
  const [facilities, setFacilities] = useState([
    { id: 1, name: "North Concourse - Pizza", waitTime: 5, status: "low" },
    { id: 2, name: "South Concourse - Burgers", waitTime: 15, status: "medium" },
    { id: 3, name: "East Concourse - Hot Dogs", waitTime: 25, status: "high" },
  ]);

  const [zones, setZones] = useState([
    { id: 1, name: "Section 101", density: "low" },
    { id: 2, name: "Section 102", density: "medium" },
    { id: 3, name: "Section 103", density: "high" },
  ]);

  const [alertTitle, setAlertTitle] = useState("");
  const [alertContent, setAlertContent] = useState("");

  const handleWaitTimeUpdate = (id: number, newWaitTime: number) => {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              waitTime: newWaitTime,
              status:
                newWaitTime <= 10 ? "low" : newWaitTime <= 20 ? "medium" : "high",
            }
          : f
      )
    );
  };

  const handleDensityUpdate = (id: number, newDensity: "low" | "medium" | "high") => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, density: newDensity } : z))
    );
  };

  const handlePostAlert = () => {
    if (alertTitle && alertContent) {
      alert("Alert posted: " + alertTitle);
      setAlertTitle("");
      setAlertContent("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Admin Panel</h1>
          <p className="subheading">Manage venue operations and real-time data</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="wait-times">Wait Times</TabsTrigger>
            <TabsTrigger value="crowd-density">Crowd Density</TabsTrigger>
            <TabsTrigger value="alerts">Post Alerts</TabsTrigger>
          </TabsList>

          {/* Wait Times Tab */}
          <TabsContent value="wait-times" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Facility Wait Times</h3>
              <div className="space-y-4">
                {facilities.map((facility) => (
                  <Card key={facility.id} className="p-4 bg-secondary">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{facility.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          value={facility.waitTime}
                          onChange={(e) =>
                            handleWaitTimeUpdate(facility.id, parseInt(e.target.value))
                          }
                          className="w-20"
                        />
                        <span className="text-xs font-sans text-muted-foreground">min</span>
                        <div
                          className={`px-3 py-1 rounded text-xs font-semibold font-sans ${getStatusColor(
                            facility.status
                          )}`}
                        >
                          {facility.status.charAt(0).toUpperCase() +
                            facility.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                Save Wait Times
              </Button>
            </Card>
          </TabsContent>

          {/* Crowd Density Tab */}
          <TabsContent value="crowd-density" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Zone Crowd Density</h3>
              <div className="space-y-4">
                {zones.map((zone) => (
                  <Card key={zone.id} className="p-4 bg-secondary">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-sm">{zone.name}</p>
                      <div className="flex gap-2">
                        {(["low", "medium", "high"] as const).map((level) => (
                          <Button
                            key={level}
                            size="sm"
                            variant={zone.density === level ? "default" : "outline"}
                            onClick={() => handleDensityUpdate(zone.id, level)}
                            className={`${
                              zone.density === level
                                ? getStatusColor(level)
                                : "bg-background"
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
                Save Crowd Density
              </Button>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Post Venue-Wide Alert</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Alert Title</label>
                  <Input
                    type="text"
                    placeholder="e.g., Gate Change, Special Offer"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Alert Content</label>
                  <textarea
                    placeholder="Enter the alert message..."
                    value={alertContent}
                    onChange={(e) => setAlertContent(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Low
                    </Button>
                    <Button variant="outline" size="sm">
                      Medium
                    </Button>
                    <Button variant="outline" size="sm">
                      High
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                onClick={handlePostAlert}
                className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Post Alert
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card className="p-6 bg-secondary mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-xs font-sans text-muted-foreground">Attendees Inside</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">45%</p>
              <p className="text-xs font-sans text-muted-foreground">Venue Capacity</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">8</p>
              <p className="text-xs font-sans text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

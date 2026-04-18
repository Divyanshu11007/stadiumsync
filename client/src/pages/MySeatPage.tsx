import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Armchair, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function MySeatPage() {
  const [, setLocation] = useLocation();
  const [section, setSection] = useState("");
  const [row, setRow] = useState("");
  const [seat, setSeat] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (section && row && seat) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">My Seat</h1>
          <p className="subheading">Find your way with step-by-step directions</p>
        </div>

        {!submitted ? (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-6">Enter Your Seat Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Section</label>
                <Input
                  type="text"
                  placeholder="e.g., 101, North, A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Row</label>
                <Input
                  type="text"
                  placeholder="e.g., A, 1, 10"
                  value={row}
                  onChange={(e) => setRow(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Seat Number</label>
                <Input
                  type="text"
                  placeholder="e.g., 1, 15, 20"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Find My Seat
              </Button>
            </form>
          </Card>
        ) : (
          <>
            {/* Seat Confirmation */}
            <Card className="p-6 mb-8 bg-accent text-accent-foreground">
              <div className="flex items-center gap-4">
                <Armchair size={48} />
                <div>
                  <p className="text-xs font-sans font-semibold tracking-widest uppercase opacity-80">
                    Your Seat
                  </p>
                  <p className="text-2xl font-bold">
                    Section {section} • Row {row} • Seat {seat}
                  </p>
                </div>
              </div>
            </Card>

            {/* Directions */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Step-by-Step Directions</h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    instruction: "Enter through the Main Entrance",
                    details: "Look for the blue signage",
                  },
                  {
                    step: 2,
                    instruction: "Head toward the North Concourse",
                    details: "Follow the crowd flow arrows on the floor",
                  },
                  {
                    step: 3,
                    instruction: "Take the escalator to Level 2",
                    details: "Restrooms are available on this level",
                  },
                  {
                    step: 4,
                    instruction: "Find Section 101 signage",
                    details: "Your section is on the right side",
                  },
                  {
                    step: 5,
                    instruction: "Locate Row A",
                    details: "Your seat is in the front rows",
                  },
                  {
                    step: 6,
                    instruction: "Find Seat 15",
                    details: "Enjoy the game!",
                  },
                ].map((direction) => (
                  <Card key={direction.step} className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">
                        {direction.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{direction.instruction}</p>
                        <p className="text-xs font-sans text-muted-foreground mt-1">
                          {direction.details}
                        </p>
                      </div>
                      {direction.step < 6 && (
                        <div className="flex items-center text-muted-foreground">
                          <ArrowRight size={16} />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Navigation Options */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full"
              >
                Change Seat
              </Button>
              <Button
                onClick={() => setLocation("/map")}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                View on Map
              </Button>
            </div>

            {/* Nearby Facilities */}
            <Card className="p-6 bg-secondary">
              <h4 className="text-sm font-semibold mb-4">Nearby Facilities</h4>
              <div className="space-y-2 text-sm font-sans">
                <p>🚻 Restrooms - 50 meters away (5 min wait)</p>
                <p>🍔 Concession - 100 meters away (10 min wait)</p>
                <p>🏥 First Aid - 150 meters away</p>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

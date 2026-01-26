import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronRight, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type Symptom = {
    id: string;
    label: string;
    description: string;
    recommendation: string;
};

type Category = {
    id: string;
    title: string;
    icon: React.ReactNode;
    symptoms: Symptom[];
};

const DIAGNOSIS_DATA: Category[] = [
    {
        id: "engine",
        title: "Engine & Performance",
        icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
        symptoms: [
            {
                id: "check-engine",
                label: "Check Engine Light is ON",
                description: "An amber or red light shaped like an engine is visible on your dashboard.",
                recommendation: "Requires a Mobile Diagnostic Scan ($140) to read the fault codes and identify the root cause."
            },
            {
                id: "no-start",
                label: "Car Won't Start",
                description: "The engine doesn't turn over at all, or makes a clicking sound when you turn the key.",
                recommendation: "Likely a battery, starter motor, or alternator issue. We can test all three on-site."
            },
            {
                id: "overheating",
                label: "Engine Overheating",
                description: "Temperature gauge is high, or steam is coming from under the hood.",
                recommendation: "DO NOT DRIVE. You risk permanent engine damage. We can diagnose cooling system leaks or pump failures."
            },
            {
                id: "power-loss",
                label: "Loss of Power",
                description: "Car feels sluggish, slow to accelerate, or 'stutters' when driving.",
                recommendation: "Could be fuel system, ignition (spark plugs), or sensor related. A diagnostic scan is the best first step."
            },
        ]
    },
    {
        id: "noises",
        title: "Strange Noises",
        icon: <Info className="h-6 w-6 text-blue-500" />,
        symptoms: [
            {
                id: "brake-noise",
                label: "Squealing or Grinding when Braking",
                description: "High-pitched noise or a rough grinding feeling when you press the brake pedal.",
                recommendation: "Brake pads are likely worn out. If grinding, your rotors may be getting damaged too."
            },
            {
                id: "suspension-noise",
                label: "Clunking or Knocking over Bumps",
                description: "Dull thuds or metallic knocks when driving over uneven roads or speed bumps.",
                recommendation: "Commonly worn suspension bushes, ball joints, or shock absorbers."
            },
            {
                id: "engine-noise",
                label: "Squealing from Engine Bay",
                description: "High-pitched squeal that changes with engine speed (often worse when cold).",
                recommendation: "Usually a worn or loose drive belt (fan belt)."
            }
        ]
    },
    {
        id: "leaks",
        title: "Leaks & Smells",
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
        symptoms: [
            {
                id: "oil-leak",
                label: "Puddles or Spots under the Car",
                description: "Dark brown or black slippery fluid on your driveway where you park.",
                recommendation: "Engine oil leak. Requires inspection to find the seal or gasket that has failed."
            },
            {
                id: "coolant-leak",
                label: "Sweet Smell or Green/Pink Fluid",
                description: "A sweet, syrup-like smell after driving, or bright colored fluid on the ground.",
                recommendation: "Coolant leak. This can lead to overheating if not fixed."
            },
            {
                id: "burning-smell",
                label: "Burning Smell (Rubber or Oil)",
                description: "Acrid smell while driving or just after stopping.",
                recommendation: "Could be oil leaking onto a hot exhaust or a dragging brake."
            }
        ]
    }
];

export default function SelfDiagnosis() {
    const [step, setStep] = useState<"category" | "symptom" | "result">("category");
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setStep("symptom");
    };

    const handleSymptomSelect = (symptom: Symptom) => {
        setSelectedSymptom(symptom);
        setStep("result");
    };

    const reset = () => {
        setStep("category");
        setSelectedCategory(null);
        setSelectedSymptom(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                    {step !== "category" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={step === "result" ? () => setStep("symptom") : reset}
                            className="mb-4 gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    )}

                    {step === "category" && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold">What's going on with your vehicle?</h3>
                                <p className="text-muted-foreground mt-2">Select the category that best describes your concern.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {DIAGNOSIS_DATA.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategorySelect(cat)}
                                        className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-center group"
                                    >
                                        <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <span className="font-bold text-lg">{cat.title}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "symptom" && selectedCategory && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold">{selectedCategory.title}</h3>
                                <p className="text-muted-foreground mt-2">Which of these is closest to what you're experiencing?</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {selectedCategory.symptoms.map((symptom) => (
                                    <button
                                        key={symptom.id}
                                        onClick={() => handleSymptomSelect(symptom)}
                                        className="flex items-center justify-between p-4 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-lg">{symptom.label}</div>
                                            <div className="text-sm text-muted-foreground">{symptom.description}</div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "result" && selectedSymptom && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 mb-4">
                                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold">We can fix that!</h3>
                                <p className="text-muted-foreground mt-2">Based on your description, here is what we suggest:</p>
                            </div>

                            <div className="p-6 rounded-xl bg-muted/50 border-2 border-dashed border-primary/20">
                                <h4 className="font-bold text-lg mb-2">Our Recommendation:</h4>
                                <p className="text-foreground">{selectedSymptom.recommendation}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link href={`/quote?service=${encodeURIComponent(selectedSymptom.label)}&description=${encodeURIComponent(selectedSymptom.description)}`}>
                                    <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                                        Get a Free Quote
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" onClick={reset} className="w-full sm:w-auto px-8 py-6 text-lg rounded-xl">
                                    Start Over
                                </Button>
                            </div>

                            <p className="text-center text-xs text-muted-foreground mt-6">
                                * Note: Proper diagnosis requires seeing the vehicle. Our mechanic will confirm everything before starting work.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

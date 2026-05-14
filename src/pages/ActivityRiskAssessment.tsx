import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore, ActivityOutline, RiskAssessmentItem } from "@/store/useStore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Waves,
  Stethoscope,
  Heart,
  Eye,
  CheckCircle2,
  Trash2,
  Plus,
  Save,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiskQuestion {
  id: string;
  category: string;
  question: string;
  chips?: string[];
}

const ACTIVITY_RISK_QUESTIONS: RiskQuestion[] = [
  // Physical Risks
  { id: "tools_sharps", category: "Physical Risks", question: "Does this activity involve use of tools, sharp objects, or hot surfaces?", chips: ["Knives/Sharps", "Hot Surfaces", "Power Tools", "Hand Tools"] },
  { id: "exertion_injury", category: "Physical Risks", question: "Is there a risk of physical over-exertion or injury?", chips: ["Fatigue", "Muscle Strain", "Impact/Collision"] },
  { id: "manual_handling", category: "Physical Risks", question: "Are there any manual handling or lifting requirements?", chips: ["Lifting", "Bending", "Pushing/Pulling"] },

  // Environmental Risks
  { id: "offsite_risk", category: "Environmental Risks", question: "Is the activity offsite? (traffic, unfamiliar environment, weather exposure)", chips: ["Traffic", "Weather", "Public Spaces", "Crowds"] },
  { id: "water_heights", category: "Environmental Risks", question: "Are there water, height, or animal-related risks?", chips: ["Water/Drowning", "Falls from Height", "Animals", "Trips/Uneven Ground"] },
  { id: "sensory_overload", category: "Environmental Risks", question: "Is there loud noise, crowds, or sensory overload potential?", chips: ["Loud Noise", "Bright Lights", "Crowds", "Strong Smells"] },

  // Health & Medical Risks
  { id: "food_allergen", category: "Health & Medical Risks", question: "Does this activity involve food preparation or consumption (allergen risk)?", chips: ["Anaphylaxis", "Choking", "Cross-contamination", "Hygiene"] },
  { id: "sun_dehydration", category: "Health & Medical Risks", question: "Is there sun exposure or dehydration risk?", chips: ["Sunburn", "Heatstroke", "Dehydration"] },
  { id: "swallowing_difficulties", category: "Health & Medical Risks", question: "Are there any risks for participants with swallowing difficulties?", chips: ["Choking", "Aspiration", "Texture modification needs"] },

  // Behavioural & Participation Risks
  { id: "trigger_behaviour", category: "Behavioural & Participation Risks", question: "Could this activity trigger distress or behaviours of concern?", chips: ["Anxiety", "Frustration", "Sensory Trigger", "Social Conflict"] },
  { id: "elopement_risk", category: "Behavioural & Participation Risks", question: "Is there risk of elopement or disorientation?", chips: ["Absconding", "Getting Lost", "Open Boundaries"] },
  { id: "focus_waiting", category: "Behavioural & Participation Risks", question: "Does the activity require high levels of focus or waiting?", chips: ["Frustration", "Disengagement", "Disruption"] },

  // Safeguarding Risks
  { id: "privacy_boundaries", category: "Safeguarding Risks", question: "Are there risks related to privacy, dignity, or personal boundaries?", chips: ["Personal Space", "Toileting Privacy", "Changing Areas"] },
  { id: "transport_safety", category: "Safeguarding Risks", question: "Is transport involved? (vehicle safety, supervision ratios)", chips: ["Loading/Unloading", "Buckle Safety", "Supervision Ratios"] },
];

export function ActivityRiskAssessment() {
  const { outlineId } = useParams();
  const navigate = useNavigate();
  const { outlines, updateOutline } = useStore();

  const outline = outlines.find((o) => o.id === outlineId);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [riskDetails, setRiskDetails] = useState<Record<string, Partial<RiskAssessmentItem>[]>>({});
  const [customRisks, setCustomRisks] = useState<RiskAssessmentItem[]>([]);

  useEffect(() => {
    if (outline && outline.risks) {
      const initialAnswers: Record<string, boolean> = {};
      const initialDetails: Record<string, Partial<RiskAssessmentItem>[]> = {};

      ACTIVITY_RISK_QUESTIONS.forEach(q => {
        const matches = outline.risks?.filter(r => r.hazard.includes(q.question));
        if (matches && matches.length > 0) {
          initialAnswers[q.id] = true;
          initialDetails[q.id] = matches;
        }
      });
      
      setAnswers(initialAnswers);
      setRiskDetails(initialDetails);
    }
  }, [outline]);

  if (!outline) {
    return <div className="p-12 text-center text-slate-500">Program Outline not found.</div>;
  }

  const steps = [
    { id: "intro", title: "Program Risk Assessment", icon: <ShieldAlert className="w-6 h-6" /> },
    ...Array.from(new Set(ACTIVITY_RISK_QUESTIONS.map(q => q.category))).map(cat => ({
       id: cat,
       title: cat,
       icon: getCategoryIcon(cat)
    })),
    { id: "custom", title: "Additional Risks", icon: <Plus className="w-6 h-6" /> },
    { id: "review", title: "Review & Finalize", icon: <CheckCircle2 className="w-6 h-6" /> }
  ];

  const currentStepData = steps[currentStep];
  const categoryQuestions = ACTIVITY_RISK_QUESTIONS.filter(q => q.category === currentStepData.id);

  function getCategoryIcon(cat: string) {
    switch (cat) {
      case "Physical Risks": return <Zap className="w-6 h-6" />;
      case "Environmental Risks": return <Waves className="w-6 h-6" />;
      case "Health & Medical Risks": return <Stethoscope className="w-6 h-6" />;
      case "Behavioural & Participation Risks": return <Heart className="w-6 h-6" />;
      case "Safeguarding Risks": return <Eye className="w-6 h-6" />;
      default: return <ShieldAlert className="w-6 h-6" />;
    }
  }

  const handleToggleAnswer = (questionId: string, val: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    if (val && (!riskDetails[questionId] || riskDetails[questionId].length === 0)) {
      setRiskDetails(prev => ({
        ...prev,
        [questionId]: [{
          rating: "Medium",
          mitigation: "",
          likelihood: "Possible",
          consequence: "Moderate"
        }]
      }));
    }
  };

  const handleAddSubRisk = (questionId: string) => {
    setRiskDetails(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), { 
        rating: "Medium", 
        mitigation: "",
        likelihood: "Possible",
        consequence: "Moderate"
      }]
    }));
  };

  const handleRemoveSubRisk = (questionId: string, index: number) => {
    setRiskDetails(prev => {
      const updated = [...(prev[questionId] || [])];
      updated.splice(index, 1);
      return { ...prev, [questionId]: updated };
    });
    if (riskDetails[questionId]?.length === 1) {
      setAnswers(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleUpdateDetail = (questionId: string, index: number, updates: Partial<RiskAssessmentItem>) => {
    setRiskDetails(prev => {
      const updated = [...(prev[questionId] || [])];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, [questionId]: updated };
    });
  };

  const handleFinalize = () => {
    const finalRisks: RiskAssessmentItem[] = [];

    ACTIVITY_RISK_QUESTIONS.forEach(q => {
      if (answers[q.id] && riskDetails[q.id]) {
        riskDetails[q.id].forEach(detail => {
          finalRisks.push({
            id: detail.id || crypto.randomUUID(),
            hazard: detail.hazard || q.question,
            rating: detail.rating || "Medium",
            likelihood: detail.likelihood || "Possible",
            consequence: detail.consequence || "Moderate",
            mitigation: detail.mitigation || "",
            responsible: detail.responsible || "Support Worker / Facilitator",
          });
        });
      }
    });

    finalRisks.push(...customRisks);

    updateOutline({
      ...outline,
      risks: finalRisks
    });

    navigate(`/activities/outlines/${outline.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/activities/outlines/${outline.id}`)} className="gap-2 -ml-3 mb-2 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Back to Outline
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            Program Risk Assessment
          </h1>
          <p className="text-slate-500 text-lg mt-1">Guided safety assessment for {outline.title}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Progress</div>
          <div className="text-2xl font-bold text-amber-600">{Math.round((currentStep / (steps.length - 1)) * 100)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-amber-600 h-full transition-all duration-300" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>

      <Card className="shadow-lg border-amber-100/50">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Intro Step */}
              {currentStepData.id === "intro" && (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Program Safety Assessment</h2>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    This guided interview helps identify potential risks associated with the <strong>{outline.title}</strong> program. We aim to identify hazards and implement sensible controls to ensure a safe and enjoyable experience for all participants.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-sm flex items-start gap-3 max-w-xl mx-auto text-left">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>Think about the typical physical, environmental, and behavioral context of this specific activity as you complete the assessment.</p>
                  </div>
                </div>
              )}

              {/* Category Questions */}
              {categoryQuestions.length > 0 && (
                <div className="space-y-10">
                  <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      {currentStepData.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{currentStepData.title}</h2>
                  </div>

                  <div className="space-y-12">
                    {categoryQuestions.map((q) => (
                      <div key={q.id} className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                           <Label className="text-lg font-medium text-slate-800 leading-snug">
                             {q.question}
                           </Label>
                           <div className="flex gap-2 shrink-0">
                             <Button 
                               variant={answers[q.id] === true ? "default" : "outline"}
                               onClick={() => handleToggleAnswer(q.id, true)}
                               className={answers[q.id] === true ? "bg-amber-600" : ""}
                             >Yes</Button>
                             <Button 
                               variant={answers[q.id] === false ? "default" : "outline"}
                               onClick={() => handleToggleAnswer(q.id, false)}
                               className={answers[q.id] === false ? "bg-slate-800" : ""}
                             >No</Button>
                           </div>
                        </div>

                        {answers[q.id] === true && riskDetails[q.id]?.map((detail, index) => (
                          <motion.div 
                            key={index}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6 mt-4 relative"
                          >
                            {riskDetails[q.id].length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-2 right-2 text-slate-400 hover:text-amber-600 h-8 w-8"
                                onClick={() => handleRemoveSubRisk(q.id, index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-bold text-slate-700">Type of Hazard</Label>
                                  {q.chips && (
                                    <div className="flex flex-wrap gap-2">
                                      {q.chips.map(chip => (
                                        <Button
                                          key={chip}
                                          variant="outline"
                                          size="sm"
                                          className={`text-[10px] h-7 px-2 ${detail.hazard?.includes(chip) ? 'bg-amber-50 border-amber-400 text-amber-700' : 'bg-white'}`}
                                          onClick={() => {
                                            const currentHazard = detail.hazard || q.question;
                                            const newHazard = (currentHazard === q.question) ? 
                                              `${chip}: ` : 
                                              (detail.hazard?.startsWith(`${chip}: `) ? detail.hazard : `${chip}: ${detail.hazard || ""}`);
                                            handleUpdateDetail(q.id, index, { hazard: newHazard });
                                          }}
                                        >
                                          {chip}
                                        </Button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-bold">Overall Risk Rating</Label>
                                  <div className="flex gap-2">
                                    {["Low", "Medium", "High", "Extreme"].map(level => (
                                      <Button
                                        key={level}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`flex-1 ${detail.rating === level ? 
                                          (level === 'Low' ? 'bg-emerald-100 border-emerald-600 text-emerald-800' :
                                           level === 'Medium' ? 'bg-amber-100 border-amber-600 text-amber-800' :
                                           level === 'High' ? 'bg-orange-100 border-orange-600 text-orange-800' :
                                           'bg-rose-100 border-rose-600 text-rose-800') : ''}`}
                                        onClick={() => handleUpdateDetail(q.id, index, { rating: level as any })}
                                      >
                                        {level}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-bold">Specific Hazard / Context</Label>
                                <Textarea 
                                  placeholder="What specific hazard exists in this context?"
                                  className="bg-white text-sm"
                                  rows={4}
                                  value={detail.hazard || q.question}
                                  onChange={(e) => handleUpdateDetail(q.id, index, { hazard: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 italic">Describe the potential event and its context.</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-bold">Current Mitigation Strategies</Label>
                              <Textarea 
                                placeholder="What steps will minimize this risk?"
                                className="bg-white text-sm"
                                rows={2}
                                value={detail.mitigation || ""}
                                onChange={(e) => handleUpdateDetail(q.id, index, { mitigation: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-bold">Responsible Role</Label>
                              <Input 
                                placeholder="e.g. Lead Facilitator"
                                className="bg-white text-sm"
                                value={detail.responsible || ""}
                                onChange={(e) => handleUpdateDetail(q.id, index, { responsible: e.target.value })}
                              />
                            </div>

                            {index === riskDetails[q.id].length - 1 && (
                              <div className="pt-2 border-t flex justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2 text-amber-600 border-amber-200"
                                  onClick={() => handleAddSubRisk(q.id)}
                                >
                                  <Plus className="w-3 h-3" /> Add Assessment for another risk
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Risks Step */}
              {currentStepData.id === "custom" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b pb-4">
                    <h2 className="text-2xl font-bold text-slate-900">Custom / Additional Risks</h2>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-4">
                    <p className="text-slate-500">Are there any other risks not covered by the guided questions?</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setCustomRisks([...customRisks, {
                        id: crypto.randomUUID(),
                        hazard: "",
                        likelihood: "Possible",
                        consequence: "Moderate",
                        rating: "Medium",
                        mitigation: "",
                        responsible: "Support Worker / Facilitator"
                      }])}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Custom Risk
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {customRisks.map((risk, index) => (
                      <Card key={risk.id} className="p-6 relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-slate-400 hover:text-rose-600"
                          onClick={() => setCustomRisks(customRisks.filter(r => r.id !== risk.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>Risk Name / Hazard</Label>
                            <Input 
                              placeholder="e.g. Risk of tool breakage"
                              value={risk.hazard}
                              onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, hazard: e.target.value } : r))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Risk Rating</Label>
                              <select 
                                className="w-full border rounded-md p-2 text-sm"
                                value={risk.rating}
                                onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, rating: e.target.value as any } : r))}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Extreme">Extreme</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Responsible Role</Label>
                                <Input 
                                  value={risk.responsible}
                                  onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, responsible: e.target.value } : r))}
                                />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Mitigation Strategy</Label>
                            <Textarea 
                               value={risk.mitigation}
                               onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, mitigation: e.target.value } : r))}
                               rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStepData.id === "review" && (
                <div className="space-y-8">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Review Summary</h2>
                    <p className="text-slate-500">Please review the identified program risks before finalizing.</p>
                  </div>

                  <div className="space-y-4">
                    {ACTIVITY_RISK_QUESTIONS.filter(q => answers[q.id]).map(q => (
                       <div key={q.id} className="space-y-2">
                         {riskDetails[q.id]?.map((detail, index) => (
                           <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Badge className={
                                  detail.rating === 'Low' ? 'bg-emerald-100 text-emerald-800 border-none' :
                                  detail.rating === 'Medium' ? 'bg-amber-100 text-amber-800 border-none' :
                                  detail.rating === 'High' ? 'bg-orange-100 text-orange-800 border-none' :
                                  'bg-rose-100 text-rose-800 border-none'
                                }>
                                  {detail.rating}
                                </Badge>
                                <span className="font-medium text-slate-900">{detail.hazard || q.question}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.category}</span>
                           </div>
                         ))}
                       </div>
                    ))}
                    {customRisks.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-200 text-slate-700 border-none">{r.rating}</Badge>
                          <span className="font-medium text-slate-900">{r.hazard}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Custom</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="p-6 bg-slate-50 border-t flex justify-between rounded-b-xl">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="min-w-[100px]"
          >
            Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="bg-amber-600 hover:bg-amber-700 text-white min-w-[100px] gap-2 shadow-md"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinalize}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px] gap-2 shadow-md"
            >
              <Save className="w-4 h-4" /> Finalize Assessment
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

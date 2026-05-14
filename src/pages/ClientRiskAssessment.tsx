import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore, Client, ClientRisk } from "@/store/useStore";
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
  HeartPulse,
  Brain,
  Eye,
  Accessibility,
  Users,
  CheckCircle2,
  Trash2,
  Plus,
  Sparkles,
  Save,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiskQuestion {
  id: string;
  category: string;
  question: string;
  autoSuggestFrom?: string;
  chips?: string[];
}

const CLIENT_RISK_QUESTIONS: RiskQuestion[] = [
  // Medical & Physical Health
  { 
    id: "diagnosed_conditions", 
    category: "Medical & Physical Health", 
    question: "Does {name} have any diagnosed medical conditions (e.g. epilepsy, diabetes, asthma, heart conditions)?",
    chips: ["Epilepsy", "Diabetes", "Asthma", "Heart Condition", "Other"]
  },
  { 
    id: "allergies", 
    category: "Medical & Physical Health", 
    question: "Does {name} have any known allergies (food, medication, environmental, insects)?",
    chips: ["Food", "Medication", "Environmental", "Insects", "Latex"]
  },
  { id: "swallowing_choking", category: "Medical & Physical Health", question: "Are there any swallowing or choking risks?", autoSuggestFrom: "mealtimePlan", chips: ["Choking", "Aspiration", "Dysphagia"] },
  { id: "fatigue_falls", category: "Medical & Physical Health", question: "Does {name} experience fatigue, dizziness, or falls risk?", chips: ["Falls Risk", "Dizziness", "Fatigue", "Seizures"] },
  { id: "skin_integrity", category: "Medical & Physical Health", question: "Are there any skin integrity / pressure care needs?", chips: ["Pressure Sores", "Dry Skin", "Rashes"] },

  // Medication
  { id: "regular_meds", category: "Medication", question: "Does {name} take regular medication?", autoSuggestFrom: "medications" },
  { id: "med_side_effects", category: "Medication", question: "Are there any known side effects or adverse reactions to medication?", chips: ["Drowsiness", "Nausea", "Agitation"] },
  { id: "med_refusal", category: "Medication", question: "Is there a risk of medication refusal or hoarding?", chips: ["Refusal", "Hoarding", "Spitting out"] },

  // Behavioural & Emotional
  { id: "behaviours_concern", category: "Behavioural & Emotional", question: "Does {name} have any behaviours of concern (e.g. aggression towards self or others, property damage, withdrawal)?", autoSuggestFrom: "bsp", chips: ["Physical Aggression", "Verbal Aggression", "Self-Harm", "Property Damage", "Withdrawal"] },
  { id: "triggers_distress", category: "Behavioural & Emotional", question: "Are there known triggers for distress or behaviours?", autoSuggestFrom: "triggers", chips: ["Noise", "Crowds", "Transitions", "Waiting", "Demands"] },
  { id: "anxiety_trauma", category: "Behavioural & Emotional", question: "Does {name} experience anxiety, trauma responses, or emotional dysregulation?", chips: ["Anxiety", "Panic Attacks", "Flashbacks", "Shutdown"] },
  { id: "self_harm", category: "Behavioural & Emotional", question: "Is there a history of self-harm or suicidal ideation?", chips: ["Cutting", "Head Banging", "Ideation"] },

  // Sensory & Environmental
  { id: "sensory", category: "Sensory & Environmental", question: "Does {name} have any sensory sensitivities (loud noises, bright lights, certain textures, crowds)?", autoSuggestFrom: "sensoryNeeds", chips: ["Noise", "Light", "Touch/Texture", "Smell", "Crowds"] },
  { id: "wandering", category: "Sensory & Environmental", question: "Is {name} at risk of wandering or getting lost?", chips: ["Absconding", "Disorientation", "Lack of Safety Awareness"] },
  { id: "fears_phobias", category: "Sensory & Environmental", question: "Are there any fears or phobias that affect participation (e.g. water, heights, animals, vehicles)?", chips: ["Water", "Heights", "Animals", "Vehicles", "Dogs"] },

  // Mobility & Daily Living
  { id: "transfers_mobility", category: "Mobility & Daily Living", question: "What level of support does {name} need with transfers and mobility?", autoSuggestFrom: "mobility", chips: ["Walking Frame", "Wheelchair", "Hoist", "1:1 Support"] },
  { id: "personal_care_risks", category: "Mobility & Daily Living", question: "Are there any risks during personal care tasks (toileting, showering, dressing)?", autoSuggestFrom: "personalCare", chips: ["Slip/Fall", "Resistance", "Temperature Sensitivity"] },
  { id: "eating_drinking_risks", category: "Mobility & Daily Living", question: "Are there any risks related to eating/drinking (speed of eating, refusal, etc.)?", autoSuggestFrom: "eating", chips: ["Speed", "Pica", "Refusal", "Choking"] },

  // Community & Social
  { id: "community_access", category: "Community & Social", question: "Are there risks when accessing the community (traffic awareness, stranger danger, transport)?", autoSuggestFrom: "community", chips: ["Traffic", "Strangers", "Public Transport", "Money Management"] },
  { id: "communication_needs", category: "Community & Social", question: "Does {name} have difficulty communicating needs or asking for help?", autoSuggestFrom: "communication", chips: ["Non-verbal", "Limited Speech", "Processing Delay"] },
  { id: "exploitation_risk", category: "Community & Social", question: "Is {name} vulnerable to financial, sexual, or emotional exploitation?", chips: ["Financial", "Social Media", "Peer Pressure"] },
];

export function ClientRiskAssessment() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, updateClient } = useStore();

  const client = clients.find((c) => c.id === clientId);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [riskDetails, setRiskDetails] = useState<Record<string, Partial<ClientRisk>[]>>({});
  const [customRisks, setCustomRisks] = useState<ClientRisk[]>([]);

  useEffect(() => {
    if (client && client.risks) {
      const initialAnswers: Record<string, boolean> = {};
      const initialDetails: Record<string, Partial<ClientRisk>[]> = {};

      // Match existing risks to questions if possible
      CLIENT_RISK_QUESTIONS.forEach(q => {
        const matches = client.risks?.filter(r => r.hazard.includes(q.question.replace('{name}', client.name)));
        if (matches && matches.length > 0) {
          initialAnswers[q.id] = true;
          initialDetails[q.id] = matches;
        }
      });
      
      setAnswers(initialAnswers);
      setRiskDetails(initialDetails);
    }
  }, [client]);

  if (!client) {
    return <div className="p-12 text-center text-slate-500">Client not found.</div>;
  }

  const steps = [
    { id: "intro", title: "Risk Assessment", icon: <ShieldAlert className="w-6 h-6" /> },
    ...Array.from(new Set(CLIENT_RISK_QUESTIONS.map(q => q.category))).map(cat => ({
       id: cat,
       title: cat,
       icon: getCategoryIcon(cat)
    })),
    { id: "custom", title: "Additional Risks", icon: <Plus className="w-6 h-6" /> },
    { id: "review", title: "Review & Finalize", icon: <CheckCircle2 className="w-6 h-6" /> }
  ];

  const currentStepData = steps[currentStep];
  const categoryQuestions = CLIENT_RISK_QUESTIONS.filter(q => q.category === currentStepData.id);

  function getCategoryIcon(cat: string) {
    switch (cat) {
      case "Medical & Physical Health": return <HeartPulse className="w-6 h-6" />;
      case "Medication": return <AlertTriangle className="w-6 h-6" />;
      case "Behavioural & Emotional": return <Brain className="w-6 h-6" />;
      case "Sensory & Environmental": return <Eye className="w-6 h-6" />;
      case "Mobility & Daily Living": return <Accessibility className="w-6 h-6" />;
      case "Community & Social": return <Users className="w-6 h-6" />;
      default: return <ShieldAlert className="w-6 h-6" />;
    }
  }

  const handleToggleAnswer = (questionId: string, val: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    if (val && (!riskDetails[questionId] || riskDetails[questionId].length === 0)) {
      setRiskDetails(prev => ({
        ...prev,
        [questionId]: [{
          level: "Low",
          mitigation: "",
        }]
      }));
    }
  };

  const handleAddSubRisk = (questionId: string) => {
    setRiskDetails(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), { level: "Low", mitigation: "" }]
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

  const handleUpdateDetail = (questionId: string, index: number, updates: Partial<ClientRisk>) => {
    setRiskDetails(prev => {
      const updated = [...(prev[questionId] || [])];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, [questionId]: updated };
    });
  };

  const handleFinalize = () => {
    const finalRisks: ClientRisk[] = [];

    // Map questions to risks
    CLIENT_RISK_QUESTIONS.forEach(q => {
      if (answers[q.id] && riskDetails[q.id]) {
        riskDetails[q.id].forEach(detail => {
            finalRisks.push({
              id: detail.id || crypto.randomUUID(),
              category: mapToCoreCategory(q.category),
              hazard: detail.hazard || q.question.replace('{name}', client.name),
              level: detail.level || "Low",
              mitigation: detail.mitigation || "",
              lastReviewed: new Date().toISOString().split('T')[0],
              nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        });
      }
    });

    // Add custom risks
    finalRisks.push(...customRisks);

    updateClient({
      ...client,
      risks: finalRisks
    });

    navigate(`/clients?clientId=${client.id}`);
  };

  function mapToCoreCategory(cat: string): any {
    if (cat.includes("Medical")) return "Medical / Health";
    if (cat.includes("Behavioural")) return "Behavioural";
    if (cat.includes("Sensory") || cat.includes("Environmental")) return "Environmental";
    if (cat.includes("Mobility")) return "Mobility / Safety";
    return "Other";
  }

  const getAutoSuggest = (q: RiskQuestion) => {
    if (!q.autoSuggestFrom) return null;
    
    switch (q.autoSuggestFrom) {
      case "mealtimePlan":
        return client.supportPlan?.mealtimePlan;
      case "medications":
        return client.medications?.filter(m => m.hasRisks).map(m => m.name).join(", ");
      case "bsp":
        return client.bsp?.strategies?.map(s => s.trigger).join(", ");
      case "triggers":
        return client.supportPlan?.triggers;
      case "sensoryNeeds":
        return client.supportPlan?.needs?.sensory?.notes;
      case "mobility":
        return client.supportPlan?.needs?.mobility?.notes;
      case "personalCare":
        return client.supportPlan?.needs?.personalCare?.notes;
      case "eating":
        return client.supportPlan?.needs?.eating?.notes;
      case "community":
        return client.supportPlan?.needs?.community?.notes;
      case "communication":
        return client.supportPlan?.needs?.communication?.notes;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/clients`)} className="gap-2 -ml-3 mb-2 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Back to Client Profile
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
            Client Risk Assessment
          </h1>
          <p className="text-slate-500 text-lg mt-1">Guided safety assessment for {client.name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Progress</div>
          <div className="text-2xl font-bold text-rose-600">{Math.round((currentStep / (steps.length - 1)) * 100)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-rose-600 h-full transition-all duration-300" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>

      <Card className="shadow-lg border-rose-100/50">
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
                  <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Safety & Risk Assessment</h2>
                  <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    This guided interview helps identify potential risks for {client.name} and establish practical mitigation strategies. We approach risk with the goal of <strong>dignity of risk</strong>—enabling {client.name} to participate in community life safely.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm flex items-start gap-3 max-w-xl mx-auto text-left">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>Where possible, we've pulled suggestions from {client.name}'s Support Plan and Medication list to help you build the assessment.</p>
                  </div>
                </div>
              )}

              {/* Category Questions */}
              {categoryQuestions.length > 0 && (
                <div className="space-y-10">
                  <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      {currentStepData.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{currentStepData.title}</h2>
                  </div>

                  <div className="space-y-12">
                    {categoryQuestions.map((q) => (
                      <div key={q.id} className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                           <Label className="text-lg font-medium text-slate-800 leading-snug">
                             {q.question.replace('{name}', client.name)}
                           </Label>
                           <div className="flex gap-2 shrink-0">
                             <Button 
                               variant={answers[q.id] === true ? "default" : "outline"}
                               onClick={() => handleToggleAnswer(q.id, true)}
                               className={answers[q.id] === true ? "bg-rose-600" : ""}
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
                                className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 h-8 w-8"
                                onClick={() => handleRemoveSubRisk(q.id, index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}

                            {index === 0 && getAutoSuggest(q) && (
                              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-900 text-xs flex items-start gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                                <div>
                                  <span className="font-bold">Suggested from {q.autoSuggestFrom?.replace('Needs', '')}: </span>
                                  {getAutoSuggest(q)}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-bold text-slate-700">Sub-type / Category</Label>
                                  {q.chips && (
                                    <div className="flex flex-wrap gap-2">
                                      {q.chips.map(chip => (
                                        <Button
                                          key={chip}
                                          variant="outline"
                                          size="sm"
                                          className={`text-[10px] h-7 px-2 ${detail.hazard?.includes(chip) ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-white'}`}
                                          onClick={() => {
                                            const currentHazard = detail.hazard || q.question.replace('{name}', client.name);
                                            // Logical replacement or addition
                                            const newHazard = (currentHazard === q.question.replace('{name}', client.name)) ? 
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
                                  <Label className="text-sm font-bold">Severity / Risk Level</Label>
                                  <div className="flex gap-2">
                                    {["Low", "Medium", "High", "Extreme"].map(level => (
                                      <Button
                                        key={level}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`flex-1 ${detail.level === level ? 
                                          (level === 'Low' ? 'bg-emerald-100 border-emerald-600 text-emerald-800' :
                                           level === 'Medium' ? 'bg-amber-100 border-amber-600 text-amber-800' :
                                           level === 'High' ? 'bg-orange-100 border-orange-600 text-orange-800' :
                                           'bg-rose-100 border-rose-600 text-rose-800') : ''}`}
                                        onClick={() => handleUpdateDetail(q.id, index, { level: level as any })}
                                      >
                                        {level}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-bold">Specific Hazard / Description</Label>
                                <Textarea 
                                  placeholder="Describe the specific hazard (e.g. Allergy: Peanuts)..."
                                  className="bg-white text-sm"
                                  rows={4}
                                  value={detail.hazard || q.question.replace('{name}', client.name)}
                                  onChange={(e) => handleUpdateDetail(q.id, index, { hazard: e.target.value })}
                                />
                                <p className="text-[10px] text-slate-400 italic">Be as specific as possible (e.g. exact allergens, specific triggers).</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-bold">Current Mitigation Strategies</Label>
                              <Textarea 
                                placeholder="What steps are currently in place to manage this?"
                                className="bg-white text-sm"
                                rows={2}
                                value={detail.mitigation || ""}
                                onChange={(e) => handleUpdateDetail(q.id, index, { mitigation: e.target.value })}
                              />
                            </div>

                            {index === riskDetails[q.id].length - 1 && (
                              <div className="pt-2 border-t flex justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2 text-rose-600 border-rose-200"
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
                        category: "Other",
                        hazard: "",
                        level: "Low",
                        mitigation: "",
                        lastReviewed: new Date().toISOString().split('T')[0],
                        nextReview: ""
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
                              placeholder="e.g. Risk of choking during swimming"
                              value={risk.hazard}
                              onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, hazard: e.target.value } : r))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Risk Level</Label>
                              <select 
                                className="w-full border rounded-md p-2 text-sm"
                                value={risk.level}
                                onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, level: e.target.value as any } : r))}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Extreme">Extreme</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <select 
                                  className="w-full border rounded-md p-2 text-sm"
                                  value={risk.category}
                                  onChange={(e) => setCustomRisks(customRisks.map((r, i) => i === index ? { ...r, category: e.target.value as any } : r))}
                                >
                                  <option value="Medical / Health">Medical / Health</option>
                                  <option value="Behavioural">Behavioural</option>
                                  <option value="Environmental">Environmental</option>
                                  <option value="Mobility / Safety">Mobility / Safety</option>
                                  <option value="Other">Other</option>
                                </select>
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
                    <p className="text-slate-500">Please review the identified risks before finalizing.</p>
                  </div>

                  <div className="space-y-4">
                    {CLIENT_RISK_QUESTIONS.filter(q => answers[q.id]).map(q => (
                       <div key={q.id} className="space-y-2">
                         {riskDetails[q.id]?.map((detail, index) => (
                           <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Badge className={
                                  detail.level === 'Low' ? 'bg-emerald-100 text-emerald-800 border-none' :
                                  detail.level === 'Medium' ? 'bg-amber-100 text-amber-800 border-none' :
                                  detail.level === 'High' ? 'bg-orange-100 text-orange-800 border-none' :
                                  'bg-rose-100 text-rose-800 border-none'
                                }>
                                  {detail.level}
                                </Badge>
                                <span className="font-medium text-slate-900">{detail.hazard || q.question.replace('{name}', client.name)}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{q.category}</span>
                           </div>
                         ))}
                       </div>
                    ))}
                    {customRisks.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-slate-200 text-slate-700 animate-pulse border-none">{r.level}</Badge>
                          <span className="font-medium text-slate-900">{r.hazard}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Custom</span>
                      </div>
                    ))}
                    {Object.values(answers).filter(v => v).length === 0 && customRisks.length === 0 && (
                      <div className="text-center p-8 text-slate-500 border border-dashed rounded-xl">
                        No risks identified. If this is correct, {client.name} is assessed as low risk for all standard categories.
                      </div>
                    )}
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
              className="bg-rose-600 hover:bg-rose-700 text-white min-w-[100px] gap-2 shadow-md"
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

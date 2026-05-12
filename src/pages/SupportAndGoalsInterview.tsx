import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useStore, InterviewDraft, SupportLevel, SupportArea } from "@/store/useStore";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  ListTodo,
  Target,
  Sparkles,
  ClipboardList
} from "lucide-react";

export function SupportAndGoalsInterview() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "full"; // full, support_only, goals_only
  
  const navigate = useNavigate();
  const { clients, interviewDrafts, saveInterviewDraft, clearInterviewDraft, updateClient } = useStore();
  
  const client = clients.find(c => c.id === clientId);
  const draft = interviewDrafts.find(d => d.clientId === clientId && d.type === mode);

  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [supportNeeds, setSupportNeeds] = useState<any>({});
  const [hopesAndDreams, setHopesAndDreams] = useState<any[]>([]);
  const [newDream, setNewDream] = useState("");
  const [smartGoals, setSmartGoals] = useState<any[]>([]);
  
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  
  useEffect(() => {
    if (hasLoadedDraft) return;

    if (draft && draft.data) {
      if (draft.data.supportNeeds) setSupportNeeds(draft.data.supportNeeds);
      if (draft.data.hopesAndDreams) setHopesAndDreams(draft.data.hopesAndDreams);
      if (draft.data.smartGoals) setSmartGoals(draft.data.smartGoals);
      setCurrentStep(draft.currentStep || 0);
    }
    
    setHasLoadedDraft(true);
  }, [draft, hasLoadedDraft]);

  if (!client) {
    return <div className="p-12 text-center">Client not found.</div>;
  }

  const needsCategories = [
    { id: "personalCare", label: "Personal Care" },
    { id: "mobility", label: "Mobility & Transfers" },
    { id: "eating", label: "Eating & Drinking / Mealtime Support" },
    { id: "communication", label: "Communication" },
    { id: "social", label: "Social Interaction & Relationships" },
    { id: "household", label: "Household Tasks" },
    { id: "community", label: "Community Access & Transport" },
    { id: "medication", label: "Medication Management" },
    { id: "emotional", label: "Emotional Regulation & Behaviour Support" },
    { id: "sensory", label: "Sensory Needs" },
    { id: "financial", label: "Financial Management" },
    { id: "learning", label: "Learning & Skill Development" },
    { id: "other", label: "Other" },
  ];

  const supportLevels: SupportLevel[] = [
    "Independent",
    "Verbal Prompt",
    "Minor Physical Assistance",
    "Major Physical Assistance",
    "Full Assistance",
    "Use of Aids"
  ];

  // Steps definition based on mode
  let steps: any[] = [];
  if (mode === "full" || mode === "support_only") {
    steps.push({ id: "intro_support", label: "Support Assessment Intro", type: "intro_support" });
    needsCategories.forEach(cat => {
      steps.push({ id: cat.id, label: cat.label, type: "support_area", category: cat });
    });
  }
  
  if (mode === "full" || mode === "goals_only") {
    steps.push({ id: "intro_goals", label: "Goals Intro", type: "intro_goals" });
    steps.push({ id: "hopes_dreams", label: "Hopes & Dreams", type: "hopes_dreams" });
    steps.push({ id: "smart_goals", label: "SMARTA Goals", type: "smart_goals" });
  }
  
  steps.push({ id: "review", label: "Review & Finalize", type: "review" });

  const currentStepData = steps[currentStep] || steps[0];

  const handleSaveDraft = (stepToSave = currentStep) => {
    saveInterviewDraft({
      clientId: client.id,
      lastSaved: new Date().toISOString(),
      type: mode as any,
      currentStep: stepToSave,
      data: { supportNeeds, hopesAndDreams, smartGoals }
    });
  };

  const handleNext = () => {
    const nextStep = currentStep < steps.length - 1 ? currentStep + 1 : currentStep;
    handleSaveDraft(nextStep);
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    const prevStep = currentStep > 0 ? currentStep - 1 : currentStep;
    handleSaveDraft(prevStep);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleAddDream = () => {
    if (newDream.trim()) {
      setHopesAndDreams([...hopesAndDreams, { id: crypto.randomUUID(), text: newDream, selected: false }]);
      setNewDream("");
    }
  };

  const generateSmartGoals = () => {
    // create a SMART goal for each selected dream
    const selectedDreams = hopesAndDreams.filter(d => d.selected);
    const existingGoalIds = smartGoals.map(sg => sg.dreamId);
    
    const newGoals = selectedDreams.filter(d => !existingGoalIds.includes(d.id)).map(d => ({
      id: crypto.randomUUID(),
      dreamId: d.id,
      title: d.text,
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timeBound: "",
      agreed: true
    }));
    
    const validGoals = smartGoals.filter(sg => selectedDreams.some(d => d.id === sg.dreamId));
    setSmartGoals([...validGoals, ...newGoals]);
  };

  const handleFinalize = () => {
    // 1. Map support needs to client.supportPlan.needs
    // 2. Map SMART goals to client.goals
    
    // Copy client
    const updatedClient = { ...client };
    
    if (mode === "full" || mode === "support_only") {
      updatedClient.supportPlan = {
        ...(updatedClient.supportPlan || {
          communicationPreferences: "",
          triggers: "",
          motivators: "",
          whatWorks: "",
          whatDoesntWork: ""
        }),
        needs: supportNeeds
      };
    }

    if (mode === "full" || mode === "goals_only") {
      const formattedGoals = smartGoals.map(sg => ({
        id: crypto.randomUUID(),
        title: sg.title,
        type: "Personal" as any,
        description: `Specific: ${sg.specific}\nMeasurable: ${sg.measurable}\nTime-bound: ${sg.timeBound}`,
        status: "Active" as any
      }));
      
      updatedClient.goals = [...(updatedClient.goals || []), ...formattedGoals];
    }
    
    updateClient(updatedClient);
    clearInterviewDraft(client.id);
    navigate(`/clients?clientId=${client.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" onClick={() => navigate(`/clients`)} className="gap-2 -ml-3 mb-2 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Back to Client Profile
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            {mode === "full" && <><Sparkles className="w-8 h-8 text-indigo-600"/> Support & Goals Interview</>}
            {mode === "support_only" && <><ClipboardList className="w-8 h-8 text-indigo-600"/> Support Needs Assessment</>}
            {mode === "goals_only" && <><Target className="w-8 h-8 text-indigo-600"/> Personal Goals Interview</>}
          </h1>
          <p className="text-slate-500 text-lg mt-2">Prepared for {client.name}</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Progress</div>
          <div className="text-2xl font-bold text-indigo-600">{Math.round((currentStep / (steps.length - 1)) * 100)}%</div>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
      </div>

      <Card className="shadow-lg border-indigo-100/50">
        <CardContent className="p-8">
          {/* STEP: Intro Support */}
          {currentStepData.type === "intro_support" && (
            <div className="space-y-6 text-center py-8">
               <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <ClipboardList className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">Support Needs Assessment</h2>
               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                 We'll go through different areas of life to understand exactly how we can best support {client.preferredName || client.name}. Remember, the goal is to promote independence while ensuring safety and comfort.
               </p>
            </div>
          )}

          {/* STEP: Support Area */}
          {currentStepData.type === "support_area" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentStepData.label}</h2>
                <p className="text-slate-500 mt-2">Select the level of support required and add specific preferences or instructions.</p>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Level of Support Needed</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {supportLevels.map(level => {
                    const isSelected = supportNeeds[currentStepData.id]?.level === level;
                    return (
                      <div 
                        key={level} 
                        onClick={() => setSupportNeeds({
                          ...supportNeeds, 
                          [currentStepData.id]: { ...(supportNeeds[currentStepData.id] || {}), level }
                        })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{level}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Client Preferences & Notes</Label>
                <Textarea 
                   placeholder={`e.g. "Prefers a quiet environment", "Needs instructions repeated twice"...`}
                   className="min-h-[120px] text-base"
                   value={supportNeeds[currentStepData.id]?.notes || ""}
                   onChange={(e) => setSupportNeeds({
                     ...supportNeeds,
                     [currentStepData.id]: { ...(supportNeeds[currentStepData.id] || {}), notes: e.target.value }
                   })}
                />
              </div>
            </div>
          )}

          {/* STEP: Intro Goals */}
          {currentStepData.type === "intro_goals" && (
            <div className="space-y-6 text-center py-8">
               <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Target className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900">Personal Goals & Dreams</h2>
               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                 This is the fun part. We will explore {client.preferredName || client.name}'s hopes, dreams, and what a "really good day" looks like for them, then translate those into measurable goals.
               </p>
            </div>
          )}

          {/* STEP: Hopes & Dreams */}
          {currentStepData.type === "hopes_dreams" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Hopes & Dreams</h2>
                <p className="text-slate-500 mt-2">What would {client.preferredName || client.name} love to do or achieve? Brainstorm ideas here without filtering.</p>
              </div>

              <div className="flex gap-3">
                <Input 
                  placeholder="e.g. Go to a concert, learn to cook pasta..." 
                  className="text-lg py-6"
                  value={newDream}
                  onChange={e => setNewDream(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddDream()}
                />
                <Button onClick={handleAddDream} size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white">Add</Button>
              </div>

              {hopesAndDreams.length > 0 && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-bold text-slate-900">Select Top Priorities (Choose 1-3)</h3>
                  <div className="grid gap-3">
                    {hopesAndDreams.map(dream => (
                      <div 
                        key={dream.id}
                        onClick={() => {
                          setHopesAndDreams(hopesAndDreams.map(d => d.id === dream.id ? { ...d, selected: !d.selected } : d));
                        }}
                        className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
                          dream.selected ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                         <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${dream.selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}>
                           {dream.selected && <CheckCircle2 className="w-4 h-4" />}
                         </div>
                         <span className={`text-lg font-medium ${dream.selected ? 'text-emerald-900' : 'text-slate-700'}`}>{dream.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: SMART Goals */}
          {currentStepData.type === "smart_goals" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Build SMARTA Goals</h2>
                <p className="text-slate-500 mt-2">Let's turn the selected dreams into structured goals.</p>
              </div>

              {hopesAndDreams.filter(d => d.selected).length === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed">
                  <p className="text-slate-500">No dreams selected. Please go back and select at least one dream to build a goal.</p>
                </div>
              ) : (
                <Tabs defaultValue={smartGoals[0]?.id} className="w-full">
                  <TabsList className="w-full flex justify-start overflow-x-auto bg-transparent border-b rounded-none p-0 h-auto">
                    {smartGoals.map((sg, idx) => (
                      <TabsTrigger 
                        key={sg.id} 
                        value={sg.id}
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-4 py-3 data-[state=active]:text-emerald-700 font-bold"
                      >
                        Goal {idx + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {smartGoals.map(sg => {
                    const updateSG = (field: string, val: string) => {
                      setSmartGoals(smartGoals.map(g => g.id === sg.id ? { ...g, [field]: val } : g));
                    };

                    return (
                      <TabsContent key={sg.id} value={sg.id} className="space-y-6 pt-6">
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                          <span className="text-xs uppercase tracking-widest font-bold text-emerald-800 mb-1 block">Based on dream</span>
                          <span className="text-emerald-900 font-semibold text-lg">{hopesAndDreams.find(d => d.id === sg.dreamId)?.text}</span>
                        </div>
                        
                        <div className="space-y-4 mt-6">
                          <div>
                            <Label className="text-sm font-bold text-slate-700">Specific (What exactly do you want to achieve?)</Label>
                            <Textarea className="mt-1" value={sg.specific} onChange={e => updateSG("specific", e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-sm font-bold text-slate-700">Measurable (How will we know when it's done?)</Label>
                            <Textarea className="mt-1" value={sg.measurable} onChange={e => updateSG("measurable", e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-sm font-bold text-slate-700">Time-Bound (When do we want to achieve this by?)</Label>
                            <Input className="mt-1" value={sg.timeBound} onChange={e => updateSG("timeBound", e.target.value)} />
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              )}
            </div>
          )}

          {/* STEP: Review */}
          {currentStepData.type === "review" && (
            <div className="space-y-8 text-center py-8">
               <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-bold text-slate-900">Ready to Finalize!</h2>
               <p className="text-slate-600 text-lg max-w-xl mx-auto">
                 You have completed the interview sections. Finalizing this will automatically update {client.preferredName || client.name}'s Support Profile and Goal tracking.
               </p>
               
               <div className="bg-slate-50 border p-6 rounded-xl max-w-sm mx-auto text-left space-y-3 mt-8">
                 <h4 className="font-bold text-slate-900 border-b pb-2">Summary</h4>
                 {mode !== "goals_only" && (
                   <p className="text-sm text-slate-700 flex justify-between">
                     <span>Support Areas Assessed:</span> 
                     <span className="font-bold">{Object.keys(supportNeeds).length} / {needsCategories.length}</span>
                   </p>
                 )}
                 {mode !== "support_only" && (
                   <p className="text-sm text-slate-700 flex justify-between">
                     <span>SMARTA Goals Generated:</span> 
                     <span className="font-bold">{smartGoals.length}</span>
                   </p>
                 )}
               </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="p-6 bg-slate-50 border-t flex justify-between rounded-b-xl items-center">
           <div>
             <Button variant="outline" className="gap-2" onClick={() => { handleSaveDraft(); alert("Draft saved successfully"); }}>
               <Save className="w-4 h-4" /> Save Draft
             </Button>
           </div>
           <div className="flex gap-3">
             <Button 
               variant="outline" 
               onClick={handleBack} 
               disabled={currentStep === 0}
               className="min-w-[100px]"
             >
               Back
             </Button>
             
             {currentStep < steps.length - 1 ? (
               <Button 
                 onClick={() => {
                   if (currentStepData.type === "hopes_dreams") {
                     generateSmartGoals();
                   }
                   handleNext();
                 }}
                 className="min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
               >
                 Next <ArrowRight className="w-4 h-4" />
               </Button>
             ) : (
               <Button 
                 onClick={handleFinalize}
                 className="min-w-[120px] bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
               >
                 <CheckCircle2 className="w-4 h-4" /> Finalize Profile
               </Button>
             )}
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  User,
  Filter,
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Activity,
  Tag,
  PlusCircle,
  Pill,
  HeartPulse,
  BrainCircuit,
  Phone,
  CalendarCheck,
  Download,
  AlertCircle,
  ClipboardList,
  Target,
  ChevronDown
} from "lucide-react";
import {
  useStore,
  Client,
  ClientRisk,
  ClientGoal,
  JournalNote,
} from "@/store/useStore";

export function Clients() {
  const navigate = useNavigate();
  const { user, clients, notes } = useStore();
  const isManager = user?.role === "Admin" || user?.role === "Coordinator";

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const clientNotes = selectedClient
    ? notes
        .filter((n) => n.clientIds.includes(selectedClient.id))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    : [];

  if (selectedClient) {
    const highExtremeRisks = (selectedClient.risks || []).filter(
      (r) => r.level === "Extreme" || r.level === "High"
    ).length > 0;

    // Check for medication risks (side effects, etc) not explicitly in risk assessment
    const medsWithRisks = selectedClient.medications?.filter(m => m.hasRisks) || [];
    const missingRiskEntryForMed = medsWithRisks.length > 0 && !selectedClient.risks?.some(r => r.category === "Medical / Health" && r.hazard.toLowerCase().includes("medication"));

    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in pb-12">
        <Button
          variant="ghost"
          onClick={() => setSelectedClientId(null)}
          className="gap-2 -ml-3 text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Button>

        {/* 1. Client Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
              {selectedClient.photoUrl ? (
                <img src={selectedClient.photoUrl} alt={selectedClient.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {selectedClient.name} {selectedClient.preferredName && <span className="text-slate-400 font-normal">({selectedClient.preferredName})</span>}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4" /> Age: {selectedClient.age || "N/A"}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> NDIS: {selectedClient.ndisNumber || "Not recorded"}</span>
                <span>•</span>
                <span className="font-semibold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">Support Level: {selectedClient.supportLevel || "Standard"}</span>
              </div>
              {selectedClient.tags && selectedClient.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedClient.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isManager && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                  <ClipboardList className="w-4 h-4" />
                  Assessments & Goals
                  <ChevronDown className="w-4 h-4 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Guided Interviews</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/clients/${selectedClient.id}/interview?mode=full`)} className="cursor-pointer py-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-indigo-600"/> Full Assessment & Goals</span>
                        <span className="text-xs text-slate-500">Run the complete support needs and personal goals interview</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/clients/${selectedClient.id}/risk-assessment`)} className="cursor-pointer py-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-600"/> Guided Risk Assessment</span>
                        <span className="text-xs text-slate-500">Identify medical, behavioral, and social risks</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/clients/${selectedClient.id}/interview?mode=support_only`)} className="cursor-pointer py-2">
                       <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-slate-500"/> Support Needs Only</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/clients/${selectedClient.id}/interview?mode=goals_only`)} className="cursor-pointer py-2">
                       <span className="flex items-center gap-2"><Target className="w-4 h-4 text-slate-500"/> Personal Goals Only</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline">Edit Profile</Button>
            </div>
          )}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto pb-2 border-b">
            <TabsList className="bg-transparent h-auto p-0 min-w-max flex gap-6 justify-start w-full">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-indigo-700">Overview</TabsTrigger>
              <TabsTrigger value="risks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-red-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-red-700">
                Risks {highExtremeRisks && <span className="ml-1.5 w-2 h-2 rounded-full bg-red-600 inline-block"></span>}
              </TabsTrigger>
              <TabsTrigger value="bsp" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-amber-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-amber-700">Behaviour Support</TabsTrigger>
              <TabsTrigger value="health" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-rose-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-rose-700">Health & Meds</TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-indigo-700">Support Plan</TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-emerald-700">Goals</TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-700">Contacts</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-indigo-700">Notes & History</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Highlight Risks */}
                <Card className={`col-span-1 md:col-span-2 shadow-sm ${highExtremeRisks ? 'border-red-200' : 'border-slate-200'}`}>
                  <CardHeader className={`${highExtremeRisks ? 'bg-red-50/50' : 'bg-slate-50'}`}>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${highExtremeRisks ? 'text-red-600' : 'text-slate-500'}`} /> 
                      Key Risk Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                     {selectedClient.risks && selectedClient.risks.length > 0 ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {selectedClient.risks.slice(0, 4).map(risk => (
                           <div key={risk.id} className="p-3 rounded-lg border bg-white flex flex-col gap-2 shadow-sm">
                             <div className="flex justify-between items-start">
                               <span className="text-sm font-bold">{risk.hazard}</span>
                               <Badge variant={risk.level === "Extreme" || risk.level === "High" ? "destructive" : "secondary"}>
                                 {risk.level}
                               </Badge>
                             </div>
                             <span className="text-xs text-slate-500">{risk.category}</span>
                             <p className="text-xs text-slate-600 line-clamp-2 mt-1">{risk.mitigation}</p>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="text-sm text-slate-500 text-center py-4">No active risks recorded.</p>
                     )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="bg-slate-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <HeartPulse className="w-5 h-5 text-rose-500" /> Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex flex-col gap-3">
                    <Button className="w-full justify-start gap-2 bg-indigo-600" onClick={() => navigate(`/journal?client=${selectedClient.id}`)}><Plus className="w-4 h-4"/> Log Note / Session</Button>
                    <Button className="w-full justify-start gap-2 bg-rose-600 hover:bg-rose-700 text-white" onClick={() => navigate(`/journal?client=${selectedClient.id}&type=medication`)}><Pill className="w-4 h-4"/> Log Medication</Button>
                    <Button variant="outline" className="w-full justify-start gap-2"><Phone className="w-4 h-4"/> Emergency Contacts</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Support Snapshot */}
              <Card className="shadow-sm border-indigo-100">
                <CardHeader className="bg-indigo-50/50">
                   <CardTitle className="text-lg">Support Snapshot (How I Need Support)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedClient.supportPlan ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 border-b pb-1 mb-2">Communication</h4>
                          <p className="text-sm text-slate-700">{selectedClient.supportPlan.communicationPreferences}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 border-b pb-1 mb-2">Motivators & Strengths</h4>
                          <p className="text-sm text-slate-700">{selectedClient.supportPlan.motivators}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-1 mb-2">What Works well</h4>
                          <p className="text-sm text-slate-700">{selectedClient.supportPlan.whatWorks}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-red-800 border-b border-red-100 pb-1 mb-2">What Doesn't Work / Triggers</h4>
                          <p className="text-sm text-slate-700">{selectedClient.supportPlan.whatDoesntWork}</p>
                          <p className="text-sm text-slate-600 mt-2 font-medium italic">Triggers: {selectedClient.supportPlan.triggers}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {selectedClient.supportPlan.mealtimePlan && (
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                             <h4 className="text-sm font-bold text-orange-900 flex items-center gap-2 mb-2">Mealtime & Eating Plan</h4>
                             <p className="text-sm text-orange-800">{selectedClient.supportPlan.mealtimePlan}</p>
                          </div>
                        )}
                        {selectedClient.bsp?.strategies && selectedClient.bsp.strategies.length > 0 && (
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                             <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2"><BrainCircuit className="w-4 h-4"/> Active BSP</h4>
                             <p className="text-xs text-amber-800 mb-2">Formal behaviour support strategies are in place.</p>
                             <Button variant="outline" size="sm" className="w-full text-amber-900 border-amber-200 hover:bg-amber-100">View Strategies</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : <div className="text-sm text-slate-500 text-center p-4">No support plan entered.</div>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SUPPORT TAB */}
            <TabsContent value="support" className="space-y-6 outline-none">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">Comprehensive Support Plan</CardTitle>
                  {isManager && (
                     <Button size="sm" variant="outline" onClick={() => navigate(`/clients/${selectedClient.id}/interview?mode=support_only`)}>
                       <ClipboardList className="w-4 h-4 mr-2" /> Update Needs
                     </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {selectedClient.supportPlan?.needs ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(selectedClient.supportPlan.needs).map(([key, need]: any) => (
                        <div key={key} className="p-4 rounded-xl border bg-white flex flex-col gap-2 shadow-sm">
                          <h4 className="font-bold text-slate-900 capitalize flex items-center justify-between">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                            <Badge variant={need.level === "Independent" ? "secondary" : "default"} className={need.level === "Independent" ? "bg-slate-100 text-slate-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"}>
                              {need.level}
                            </Badge>
                          </h4>
                          <p className="text-sm text-slate-600 mt-2">{need.notes || "No additional preferences noted."}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500">
                      <p className="mb-4">No detailed support needs assessment recorded.</p>
                      <Button onClick={() => navigate(`/clients/${selectedClient.id}/interview?mode=support_only`)}>
                        Start Support Assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RISKS TAB */}
            <TabsContent value="risks" className="space-y-6 outline-none">
              {missingRiskEntryForMed && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-900 text-sm">Action Recommended: Missing Medical Risk</h3>
                      <p className="text-red-700 text-sm mt-1">This client has medications flagged with risk factors (e.g. PRN usage or side effects), but no "Medical / Health" risk for medication has been defined in the Risk Assessment below.</p>
                      {isManager && <Button size="sm" variant="outline" className="mt-3 bg-white text-red-800 border-red-200">Resolve Warning</Button>}
                    </div>
                  </div>
                </div>
              )}

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">Comprehensive Risk Assessment</CardTitle>
                  {isManager && <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Risk</Button>}
                </CardHeader>
                <CardContent className="p-0">
                  {selectedClient.risks && selectedClient.risks.length > 0 ? (
                    <div className="divide-y relative">
                      {selectedClient.risks.map((risk) => (
                        <div key={risk.id} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-start hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300 transition-colors">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{risk.category}</span>
                            <div className="font-bold text-lg text-slate-900">{risk.hazard}</div>
                            <div className="mt-2 text-xs text-slate-500">
                              Reviewed: {risk.lastReviewed}<br/>
                              Next Due: {risk.nextReview}
                            </div>
                          </div>
                          <div>
                            <Badge className={
                                risk.level === "Extreme" ? "bg-red-600 hover:bg-red-700" : 
                                risk.level === "High" ? "bg-orange-500 hover:bg-orange-600" : 
                                risk.level === "Medium" ? "bg-amber-400 text-amber-950 hover:bg-amber-500" : 
                                "bg-emerald-500 hover:bg-emerald-600"
                              }
                            >
                              {risk.level} Risk
                            </Badge>
                          </div>
                          <div className="md:col-span-2 bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
                            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block mb-2">Mitigation / Strategies</span>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{risk.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="p-12 text-center text-slate-500">No risk records found.</div>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* BSP TAB */}
            <TabsContent value="bsp" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm md:col-span-1 border-slate-200">
                  <CardHeader className="bg-slate-50">
                    <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-amber-600" /> Formal BSP Document</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {selectedClient.bsp?.fileName ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-4">
                          <FileText className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{selectedClient.bsp.fileName}</h4>
                            <p className="text-xs text-slate-500 mt-1">Version: {selectedClient.bsp.version} • Uploaded: {selectedClient.bsp.uploadDate}</p>
                          </div>
                        </div>
                        <Button className="w-full gap-2 bg-white text-amber-800 border-amber-200 hover:bg-amber-50" variant="outline"><Download className="w-4 h-4"/> Download Current BSP</Button>
                      </div>
                    ) : (
                      <div className="text-center p-6 border border-dashed rounded-lg">
                        <p className="text-sm text-slate-500 mb-4">No formal Behaviour Support Plan uploaded.</p>
                        {isManager && <Button size="sm" variant="outline">Upload BSP</Button>}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-sm md:col-span-2 border-slate-200">
                  <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
                     <CardTitle className="text-lg flex items-center gap-2">Response Strategies</CardTitle>
                     <div className="flex gap-2">
                       <Button size="sm" variant="outline" className="gap-2 bg-white text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => navigate(`/journal?client=${selectedClient.id}&type=incident`)}>
                         <AlertTriangle className="w-4 h-4"/> Log Incident
                       </Button>
                       {isManager && <Button size="sm" variant="outline"><Plus className="w-4 h-4"/> Add Strategy</Button>}
                     </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {selectedClient.bsp?.strategies && selectedClient.bsp.strategies.length > 0 ? (
                      <div className="divide-y relative">
                        {selectedClient.bsp.strategies.map(strat => (
                          <div key={strat.id} className="p-6">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded uppercase font-bold">Trigger / Antecedent</span>
                                {strat.trigger}
                              </h4>
                              {strat.isFormal && <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Formal BSP</Badge>}
                            </div>
                            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                               <p className="text-sm font-bold text-slate-800 mb-1">Recommended Response / Strategy:</p>
                               <p className="text-sm text-slate-700">{strat.strategy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="p-12 text-center text-slate-500">No documented strategies.</div>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* HEALTH & MEDS TAB */}
            <TabsContent value="health" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="bg-rose-50 border-b border-rose-100 flex flex-row items-center justify-between">
                     <CardTitle className="text-lg flex items-center gap-2"><Pill className="w-5 h-5 text-rose-600" /> Current Medications</CardTitle>
                     <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-2" onClick={() => navigate(`/journal?client=${selectedClient.id}&type=medication`)}>Log Administration</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {selectedClient.medications && selectedClient.medications.length > 0 ? (
                      <div className="divide-y relative">
                         {selectedClient.medications.map(med => (
                           <div key={med.id} className="p-5 flex justify-between items-start">
                             <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-lg text-slate-900">{med.name}</h4>
                                 {med.prn && <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">PRN</Badge>}
                               </div>
                               <p className="text-sm text-slate-600 font-medium">{med.dose} • {med.route}</p>
                               <p className="text-xs text-slate-500 mt-2"><span className="font-semibold text-slate-700">Schedule:</span> {med.schedule}</p>
                               {med.notes && <p className="text-xs text-slate-500 mt-1 italic">{med.notes}</p>}
                             </div>
                             {med.hasRisks && (
                               <div title="This medication has associated risks. Refer to Risk Assessment." className="bg-orange-100 p-2 rounded-full text-orange-700"><AlertTriangle className="w-4 h-4" /></div>
                             )}
                           </div>
                         ))}
                      </div>
                    ) : <div className="p-12 text-center text-slate-500">No active medications listed.</div>}
                  </CardContent>
                </Card>

                {/* Mealtime Plan */}
                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="bg-orange-50 border-b border-orange-100">
                     <CardTitle className="text-lg flex items-center gap-2 text-orange-900">Mealtime & Nutrition Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     {selectedClient.supportPlan?.mealtimePlan ? (
                       <div className="space-y-4">
                         <div className="bg-white p-4 rounded-lg border shadow-sm">
                           <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide mb-2">Dietary Requirements / Plan</h4>
                           <p className="text-slate-700 text-sm">{selectedClient.supportPlan.mealtimePlan}</p>
                         </div>
                         <Button className="w-full gap-2 bg-white text-orange-700 border-orange-200 hover:bg-orange-50" variant="outline" onClick={() => navigate(`/journal?client=${selectedClient.id}&type=meal`)}>Log Meal / Fluid Intake</Button>
                       </div>
                     ) : (
                       <div className="text-center p-6 text-slate-500 text-sm flex flex-col items-center">
                         <p className="mb-4">No specialized mealtime plan recorded. Standard diet assumed unless specified.</p>
                       </div>
                     )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CONTACTS TAB */}
            <TabsContent value="contacts" className="outline-none">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Network & Allied Health</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/journal?client=${selectedClient.id}&type=communication`)}>
                      <FileText className="w-4 h-4 mr-2" /> Log Communication
                    </Button>
                    {isManager && <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2"/> Add Contact</Button>}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedClient.contacts && selectedClient.contacts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedClient.contacts.map(contact => (
                        <div key={contact.id} className="p-4 rounded-xl border flex flex-col gap-3 shadow-sm bg-white">
                          <div className="flex justify-between items-start">
                             <div>
                               <h4 className="font-bold text-slate-900">{contact.name}</h4>
                               <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{contact.relationship}</span>
                             </div>
                             {contact.isEmergency && <span title="Emergency Contact"><AlertCircle className="w-5 h-5 text-red-500" /></span>}
                          </div>
                          <div className="bg-slate-50 rounded-md p-2 space-y-1 mt-auto">
                            <div className="text-sm font-medium flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400" /> {contact.phone}</div>
                            {contact.email && <div className="text-sm text-slate-600">{contact.email}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-center text-slate-500 p-8">No personal or allied health contacts recorded.</div>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* KEEP EXISTING TABS MAPPED FOR NOTES & GOALS */}
            <TabsContent value="goals" className="outline-none space-y-6">
                <div className="flex items-center justify-between mt-4">
                  <h2 className="text-xl font-bold tracking-tight">NDIS & Personal Goals</h2>
                  <Button size="sm" variant="outline" className="gap-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" onClick={() => navigate(`/journal?client=${selectedClient.id}&type=goal`)}>
                    <FileText className="w-4 h-4"/> Log Progress Note
                  </Button>
                </div>
                {selectedClient.goals && selectedClient.goals.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClient.goals.map((goal) => (
                      <Card key={goal.id} className="shadow-sm border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${goal.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                              {goal.status}
                            </span>
                            <Badge variant="outline">{goal.type} Goal</Badge>
                          </div>
                          <h4 className="font-bold text-lg text-slate-900">
                            {goal.title}
                          </h4>
                          <p className="text-sm text-slate-600 mt-2 font-medium">
                            {goal.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center text-slate-500 text-sm shadow-sm">
                    No active outcomes or goals recorded.
                  </Card>
                )}
            </TabsContent>

            <TabsContent value="notes" className="outline-none space-y-6">
                <div className="flex justify-between items-center mt-4">
                  <h2 className="text-xl font-bold tracking-tight">Documentation History</h2>
                  <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4"/> Filter Notes</Button>
                </div>
                {clientNotes.length > 0 ? (
                  <div className="space-y-6">
                    {clientNotes.map((note) => (
                      <Card key={note.id} className="overflow-hidden shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b py-3 px-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold text-slate-500 mb-1">
                                {note.noteType}
                              </div>
                              <h3 className="font-bold text-slate-900">
                                {note.subject}
                              </h3>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              {new Date(note.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                          {note.content}

                          {note.noteType === "Activity / Session Note" && note.barriers && (
                              <div className="bg-amber-50 border border-amber-100 rounded-md p-4 mt-6 text-xs space-y-2">
                                <h4 className="font-bold text-amber-800 flex items-center gap-1.5 text-sm mb-3">
                                  <AlertTriangle className="w-4 h-4" /> Barriers & Facilitation
                                </h4>
                                {note.barriers.physical && (<div><span className="font-semibold text-slate-700">Physical:</span> {note.barriers.physical}</div>)}
                                {note.barriers.sensory && (<div><span className="font-semibold text-slate-700">Sensory:</span> {note.barriers.sensory}</div>)}
                                {note.barriers.strategies && (<div><span className="font-semibold text-slate-700">Strategies:</span> {note.barriers.strategies}</div>)}
                              </div>
                            )}

                          {note.linkedGoalIds && note.linkedGoalIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                              {note.linkedGoalIds.map((gid) => {
                                const goal = selectedClient.goals?.find((g) => g.id === gid);
                                if (!goal) return null;
                                return (
                                  <span key={gid} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
                                    <Tag className="w-3 h-3" /> Linked to: {goal.title}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center text-slate-500 shadow-sm">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No notes found for this client.
                  </Card>
                )}
            </TabsContent>

          </div>
        </Tabs>
      </div>
    );
  }

  // LIST VIEW (Unchanged core logic, just modernised UI)
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage client profiles, risk assessments, and documentation.
          </p>
        </div>
        {isManager && (
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 h-10 text-white">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9 bg-white shadow-sm h-10"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 h-10 bg-white shadow-sm">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const highExtremeRisks = (client.risks || []).filter(
            (r) => r.level === "Extreme" || r.level === "High",
          ).length;

          return (
            <Card 
               key={client.id} 
               onClick={() => setSelectedClientId(client.id)}
               className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden"
            >
              <CardContent className="p-0">
                 <div className="p-6">
                   <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border-2 border-white shadow-sm">
                        <User className="w-6 h-6" />
                     </div>
                     {highExtremeRisks > 0 && (
                        <div className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-red-100">
                          <AlertTriangle className="w-3 h-3" /> {highExtremeRisks} Risk
                        </div>
                     )}
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{client.name}</h3>
                   <div className="text-sm text-slate-500 mt-1 mb-4 flex items-center gap-2">
                     <span className="font-medium">{client.supportLevel || "Standard"} Support</span> • {client.age || "??"} yrs
                   </div>
                   
                   {client.tags && client.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pb-4">
                        {client.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 font-medium text-slate-600">{tag}</Badge>
                        ))}
                        {client.tags.length > 3 && <Badge variant="secondary" className="text-[10px] bg-slate-100">+{client.tags.length - 3}</Badge>}
                      </div>
                   ) : <div className="h-[22px] mb-4"></div>}
                 </div>
                 
                 <div className="border-t bg-slate-50/50 p-4 py-3 flex text-xs font-bold text-slate-500 uppercase tracking-widest justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                    <span>View Profile</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                 </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredClients.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            No clients found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

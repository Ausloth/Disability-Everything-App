import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useStore, ActivityOutline, OutlineWeek, TimelineEvent, RiskAssessmentItem } from "@/store/useStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Copy,
  Save,
  FileText,
  CalendarDays,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Settings,
  Info,
  Clock,
  MapPin,
  Users,
  Truck,
  DollarSign,
  ClipboardList,
  ChevronRight,
  Eye,
  CheckCircle2,
  History,
  Download,
  Share2,
  X,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// Helper to add weeks to a date
function getWeekDate(startDateStr: string, weekIndex: number) {
  if (!startDateStr) return "TBA";
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return "TBA";
  date.setDate(date.getDate() + weekIndex * 7);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OutlineEditor() {
  const { outlineId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { outlines, updateOutline, addOutline, user, activities } = useStore();

  const [outline, setOutline] = useState<ActivityOutline | null>(null);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [promptType, setPromptType] = useState<'full' | 'specific' | 'guide' | 'timeline' | 'materials'>('full');
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to parse time for sorting
  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):?(\d*)?\s*(AM|PM|am|pm)?/);
    if (!match) return 0;
    let [_, hours, minutes, period] = match;
    let h = parseInt(hours);
    let m = parseInt(minutes || '0');
    if (period?.toLowerCase() === 'pm' && h < 12) h += 12;
    if (period?.toLowerCase() === 'am' && h === 12) h = 0;
    return h * 60 + m;
  };

  // Helper for generating IDs
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 11);
  };

  useEffect(() => {
    const activityIdParam = searchParams.get('activityId');

    if (outlineId === "new") {
      const activity = activities.find(a => a.id === activityIdParam);
      const newOutline: ActivityOutline = {
        id: generateId(),
        activityId: activityIdParam || "",
        title: activity ? `${activity.name} Program` : "New Activity Program",
        style: "Recurring",
        category: activity?.category || "General",
        startDate: new Date().toISOString().split('T')[0],
        durationWeeks: 12,
        weeks: Array.from({ length: 12 }).map((_, i) => ({
          id: generateId(),
          weekNumber: i + 1,
          goalProgression: "",
          tasksContent: "",
          locationTarget: "",
          materialsCost: "",
          staffGuide: "",
        })),
        equipment: [],
        timeline: [
          { id: generateId(), time: "09:30 AM", activity: "Arrival & Welcome" },
          { id: generateId(), time: "10:00 AM", activity: "Main Morning Activity" },
          { id: generateId(), time: "11:30 AM", activity: "Pack up & Reflection" },
          { id: generateId(), time: "12:00 PM", activity: "Departure" },
        ],
        isPublished: false,
      };
      setOutline(newOutline);
    } else {
      const found = outlines.find((o) => o.id === outlineId);
      if (found) {
        setOutline({ ...found });
      }
    }
  }, [outlineId, outlines, activities, searchParams]);

  const handleAIGenerate = async () => {
    setIsSaving(true);
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedWeekIdx = outline.weeks.findIndex(w => w.weekNumber === selectedWeekNum);
    if (selectedWeekIdx === -1) return;

    const newWeeks = [...outline.weeks];
    const prevWeek = selectedWeekIdx > 0 ? outline.weeks[selectedWeekIdx - 1] : null;

    // Plausible data based on program title/style
    const isProgression = outline.style === "Progressive";
    const title = outline.title.toLowerCase();

    // Mock generation logic
    let goal = "";
    let tasks = "";
    let guide = "";

    if (title.includes("bowling")) {
      goal = isProgression ? `Master basic release for week ${selectedWeekNum}` : "Enjoy social bowling and improve coordination";
      tasks = `1. Warm up exercises\n2. ${selectedWeekNum % 2 === 0 ? "Target practice with bumpers" : "Full game play"}\n3. Team scoring`;
      guide = "Monitor for fatigue. Encourage turn taking.";
    } else if (title.includes("art") || title.includes("creative")) {
      goal = isProgression ? `Learn phase ${selectedWeekNum} of project` : "Explore creative expression";
      tasks = "1. Set up materials\n2. Main art task\n3. Cleanup and gallery walk";
      guide = "Provide sensory choices for textures.";
    } else {
      goal = `Advance ${isProgression ? "skills" : "engagement"} for phase ${selectedWeekNum}`;
      tasks = "1. Arrival\n2. Key session activity\n3. Pack up";
      guide = "Ensure staff are positioned for maximum inclusion.";
    }

    newWeeks[selectedWeekIdx] = {
      ...newWeeks[selectedWeekIdx],
      goalProgression: goal,
      tasksContent: tasks,
      staffGuide: guide,
    };

    setOutline({ ...outline, weeks: newWeeks });
    setIsSaving(false);
  };

  const handleDeleteRisk = (riskId: string) => {
    if (!outline.risks) return;
    const newRisks = outline.risks.filter(r => r.id !== riskId);
    setOutline({ ...outline, risks: newRisks });
  };

  const handleGeneratePrompt = () => {
    if (!outline) return;

    const context = `
CONTEXT:
Program Name: ${outline.title}
Category: ${outline.category}
Program Style: ${outline.style} (Goal: ${outline.style === 'Progressive' ? 'Build skills incrementally week-over-week' : 'High engagement recurring activity'})
Duration: ${outline.durationWeeks} weeks
Location: ${outline.locationDescription || 'Various'}
Target Participants: Disability Day Service individuals (NDIS)
Standard Staff Ratio: ${outline.staffRatio || 'Not specified'}

Timeline:
${outline.timeline.map(t => `- ${t.time}: ${t.activity}`).join('\n')}

REQUEST:
`;

    let request = "";
    switch (promptType) {
      case 'full':
        request = `Generate a comprehensive ${outline.durationWeeks}-week program outline. 
For each week (1 to ${outline.durationWeeks}), provide:
1. Focus/Goal (Short, actionable)
2. Main Activity Content (Detailed, step-by-step for a group)
3. Facilitation Guide for Staff (Specific prompts or safety tips)
Format as a numbered list where each week starts with "WEEK [X]:"`;
        break;
      case 'specific':
        request = `Generate detailed program content specifically for Week ${selectedWeekNum} of this program.
${outline.style === 'Progressive' ? `This is week ${selectedWeekNum} of a skills-building program, so ensure the difficulty is appropriate for someone who has completed ${selectedWeekNum - 1} weeks.` : `This is a recurring program; focus on high engagement and social interaction.`}
Include: Focus/Goal, Actionable Tasks, and a Staff Support Guide.`;
        break;
      case 'guide':
        request = `Create a comprehensive Facilitation & Staff Support Guide for this program. 
Focus on:
- Risk management for ${outline.category} activities
- Engagement strategies for individuals with diverse sensory needs
- Social prompts to encourage peer interaction
- Transition cues based on our timeline`;
        break;
      case 'timeline':
        request = `Review our current timeline and suggest improvements or more specific sub-tasks for each block to maximize engagement for participants in a ${outline.category} session.`;
        break;
      case 'materials':
        request = `Generate a complete list of materials, equipment, and approximate costs for this ${outline.durationWeeks}-week program. Suggest creative, budget-friendly alternatives where possible.`;
        break;
    }

    setGeneratedPrompt(context + request);
  };

  useEffect(() => {
    if (isAiPanelOpen) {
      handleGeneratePrompt();
    }
  }, [isAiPanelOpen, promptType, selectedWeekNum, outline?.title]);

  if (!outline) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
    </div>
  );

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (outlineId === "new") {
        addOutline(outline);
        navigate(`/activities/outlines/${outline.id}`, { replace: true });
      } else {
        updateOutline(outline);
      }
      setIsSaving(false);
    }, 500);
  };

  const handleUpdateOutline = (updates: Partial<ActivityOutline>) => {
    setOutline(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleUpdateWeek = (weekNum: number, updates: Partial<OutlineWeek>) => {
    if (!outline) return;
    const updatedWeeks = outline.weeks.map((w) =>
      w.weekNumber === weekNum ? { ...w, ...updates } : w
    );
    handleUpdateOutline({ weeks: updatedWeeks });
  };

  const handleUpdateTimeline = (id: string, updates: Partial<TimelineEvent>) => {
    let updatedTimeline = outline.timeline.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );

    // Auto-fix: Sort by time whenever a time is changed
    if (updates.time) {
      updatedTimeline.sort((a, b) => parseTime(a.time) - parseTime(b.time));
    }

    handleUpdateOutline({ timeline: updatedTimeline });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = outline.timeline.findIndex((t) => t.id === active.id);
      const newIndex = outline.timeline.findIndex((t) => t.id === over.id);
      handleUpdateOutline({
        timeline: arrayMove(outline.timeline, oldIndex, newIndex),
      });
    }
  };

  const handleApplyTemplate = (type: 'morning' | 'afternoon' | 'allday') => {
    let template: TimelineEvent[] = [];
    if (type === 'morning') {
      template = [
        { id: generateId(), time: "09:00 AM", activity: "Arrival & Welcome" },
        { id: generateId(), time: "09:30 AM", activity: "Morning Tea & Briefing" },
        { id: generateId(), time: "10:00 AM", activity: "Main Morning Session" },
        { id: generateId(), time: "11:30 AM", activity: "Reflection & Pack Up" },
        { id: generateId(), time: "12:00 PM", activity: "Program End" },
      ];
    } else if (type === 'afternoon') {
      template = [
        { id: generateId(), time: "01:00 PM", activity: "Arrival & Welcome" },
        { id: generateId(), time: "01:30 PM", activity: "Main Afternoon Session" },
        { id: generateId(), time: "03:30 PM", activity: "Afternoon Tea & Wrap" },
        { id: generateId(), time: "04:00 PM", activity: "Departure" },
      ];
    } else {
      template = [
        { id: generateId(), time: "09:30 AM", activity: "Arrival & Morning Tea" },
        { id: generateId(), time: "10:00 AM", activity: "Main Activity Part 1" },
        { id: generateId(), time: "12:00 PM", activity: "Lunch Break" },
        { id: generateId(), time: "01:00 PM", activity: "Main Activity Part 2" },
        { id: generateId(), time: "02:30 PM", activity: "Pack Up & Cleaning" },
        { id: generateId(), time: "03:00 PM", activity: "End of Program" },
      ];
    }
    handleUpdateOutline({ timeline: template });
  };

  const handleAddTimelineRow = () => {
    handleUpdateOutline({
      timeline: [...(outline.timeline || []), { id: generateId(), time: "", activity: "" }]
    });
  };

  const handleRemoveTimelineRow = (id: string) => {
    handleUpdateOutline({
      timeline: outline.timeline.filter(item => item.id !== id)
    });
  };

  const handleAddEquipment = (item: string) => {
    if (!item.trim()) return;
    handleUpdateOutline({ equipment: [...outline.equipment, item.trim()] });
  };

  const handleRemoveEquipment = (index: number) => {
    handleUpdateOutline({
      equipment: outline.equipment.filter((_, i) => i !== index)
    });
  };

  const selectedWeek = outline.weeks?.find(w => w.weekNumber === selectedWeekNum);

  const handleDuplicatePreviousWeek = () => {
    if (selectedWeekNum <= 1) return;
    const prevWeek = outline.weeks.find(w => w.weekNumber === selectedWeekNum - 1);
    if (!prevWeek || !selectedWeek) return;
    
    handleUpdateWeek(selectedWeekNum, {
      goalProgression: prevWeek.goalProgression,
      tasksContent: prevWeek.tasksContent,
      locationTarget: prevWeek.locationTarget,
      materialsCost: prevWeek.materialsCost,
      staffGuide: prevWeek.staffGuide,
    });
  };

  const handleMarkSameAsFirst = () => {
    const firstWeek = outline.weeks.find(w => w.weekNumber === 1);
    if (!firstWeek || !selectedWeek) return;
    
    handleUpdateWeek(selectedWeekNum, {
      goalProgression: firstWeek.goalProgression,
      tasksContent: firstWeek.tasksContent,
      locationTarget: firstWeek.locationTarget,
      materialsCost: firstWeek.materialsCost,
      staffGuide: firstWeek.staffGuide,
    });
  };

  const calculateProgress = () => {
    if (!outline?.weeks) return 0;
    const totalWeeks = outline.weeks.length;
    if (totalWeeks === 0) return 0;
    const completedWeeks = outline.weeks.filter(w => w.tasksContent.length > 20).length;
    return Math.round((completedWeeks / totalWeeks) * 100);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleImportFromAI = () => {
    if (!importText.trim() || !outline) return;

    // Simple parser for "WEEK X:" or similar markings
    const newWeeks = [...outline.weeks];
    const lines = importText.split('\n');
    let currentWeekNum = -1;
    let currentGoal = "";
    let currentTasks = "";
    let currentGuide = "";

    const flushSelection = () => {
      if (currentWeekNum !== -1) {
        const idx = newWeeks.findIndex(w => w.weekNumber === currentWeekNum);
        if (idx !== -1) {
          newWeeks[idx] = {
            ...newWeeks[idx],
            goalProgression: currentGoal.trim() || newWeeks[idx].goalProgression,
            tasksContent: currentTasks.trim() || newWeeks[idx].tasksContent,
            staffGuide: currentGuide.trim() || newWeeks[idx].staffGuide,
          };
        }
      }
    };

    lines.forEach(line => {
      const weekMatch = line.match(/WEEK\s*(\d+):?/i);
      if (weekMatch) {
        flushSelection();
        currentWeekNum = parseInt(weekMatch[1]);
        currentGoal = "";
        currentTasks = "";
        currentGuide = "";
      } else if (line.toLowerCase().includes("focus:") || line.toLowerCase().includes("goal:")) {
        currentGoal = line.split(':')[1] || "";
      } else if (line.toLowerCase().includes("guide:") || line.toLowerCase().includes("staff:")) {
        currentGuide = line.split(':')[1] || "";
      } else if (line.trim().length > 0 && currentWeekNum !== -1) {
        currentTasks += line + "\n";
      }
    });

    flushSelection();
    handleUpdateOutline({ weeks: newWeeks });
    setIsImporting(false);
    setImportText("");
    toast.success("Successfully imported content from LLM response!");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/activities")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{outline.title}</h1>
              {outline.isPublished ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Published</Badge>
              ) : (
                <Badge variant="outline" className="text-slate-400 border-slate-200">Draft</Badge>
              )}
            </div>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-semibold text-emerald-600">{outline.style} Program</span>
              <span>•</span>
              <span>{outline.durationWeeks} Weeks</span>
              <span>•</span>
              <span className="flex items-center gap-1"><History className="w-4 h-4" /> Last edited {new Date().toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setActiveTab("preview")}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg hover:shadow-emerald-100 transition-all" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <div className="animate-spin border-2 border-white/20 border-t-white rounded-full w-4 h-4" /> : <Save className="w-4 h-4" />}
            {outlineId === "new" ? "Create Program" : "Save Changes"}
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8 relative overflow-hidden">
        <div className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100 p-1 mb-8">
              <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4" /> General Info
              </TabsTrigger>
              <TabsTrigger value="program" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CalendarDays className="w-4 h-4" /> Weekly Program
              </TabsTrigger>
              <TabsTrigger value="risks" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <ShieldAlert className="w-4 h-4" /> Risk Assessment
              </TabsTrigger>
              <TabsTrigger value="closing" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <ClipboardList className="w-4 h-4" /> Closing & Celebration
              </TabsTrigger>
            </TabsList>

            {/* TAB: General Info */}
            <TabsContent value="general" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-emerald-600" /> Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Program Title</Label>
                      <Input value={outline.title} onChange={e => handleUpdateOutline({ title: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Program Style</Label>
                        <select 
                          className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 bg-white"
                          value={outline.style}
                          onChange={e => handleUpdateOutline({ style: e.target.value as any })}
                        >
                          <option value="Recurring">Recurring</option>
                          <option value="Progressive">Progressive</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={outline.category || ""} onChange={e => handleUpdateOutline({ category: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" value={outline.startDate} onChange={e => handleUpdateOutline({ startDate: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (Weeks)</Label>
                        <Input type="number" value={outline.durationWeeks} onChange={e => handleUpdateOutline({ durationWeeks: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" /> Logistics & Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Input placeholder="e.g. Wednesday" value={outline.dayOfWeek || ""} onChange={e => handleUpdateOutline({ dayOfWeek: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Start</Label>
                        <Input placeholder="9:30 AM" value={outline.startTime || ""} onChange={e => handleUpdateOutline({ startTime: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>End</Label>
                        <Input placeholder="3:00 PM" value={outline.endTime || ""} onChange={e => handleUpdateOutline({ endTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</Label>
                        <Input placeholder="Main Hub or Venue name" value={outline.locationDescription || ""} onChange={e => handleUpdateOutline({ locationDescription: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Truck className="w-3 h-3" /> Transport</Label>
                        <Input placeholder="Bus, Train, Drop-off" value={outline.transportNotes || ""} onChange={e => handleUpdateOutline({ transportNotes: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><DollarSign className="w-3 h-3" /> Cost (per week)</Label>
                        <Input placeholder="$15.00" value={outline.standardCost || ""} onChange={e => handleUpdateOutline({ standardCost: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Users className="w-3 h-3" /> Staff Ratio</Label>
                        <Input placeholder="1:3 or 1:1" value={outline.staffRatio || ""} onChange={e => handleUpdateOutline({ staffRatio: e.target.value })} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 shadow-sm border-slate-200">
                  <CardHeader className="py-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Daily Program Timeline</CardTitle>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700"
                            onClick={() => handleApplyTemplate('morning')}
                          >
                            Morning
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700"
                            onClick={() => handleApplyTemplate('afternoon')}
                          >
                            Afternoon
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700"
                            onClick={() => handleApplyTemplate('allday')}
                          >
                            All-Day
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAddTimelineRow} className="gap-2 shrink-0">
                        <Plus className="w-4 h-4" /> Add Row
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="p-0">
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="w-10"></TableHead>
                            <TableHead className="w-32 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Time</TableHead>
                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Activity / Task</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <SortableContext 
                            items={outline.timeline}
                            strategy={verticalListSortingStrategy}
                          >
                            {outline.timeline.map((item) => (
                              <SortableTimelineRow 
                                key={item.id} 
                                item={item}
                                onUpdate={handleUpdateTimeline}
                                onRemove={handleRemoveTimelineRow}
                              />
                            ))}
                          </SortableContext>
                        </TableBody>
                      </Table>
                    </DndContext>
                  </div>
                </Card>

                <Card className="shadow-sm border-slate-200">
                  <CardHeader className="py-4 border-b">
                    <CardTitle className="text-lg">General Equipment</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add item..." 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleAddEquipment(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button variant="secondary" size="icon" onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) {
                          handleAddEquipment(input.value);
                          input.value = "";
                        }
                      }}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1">
                        {outline.equipment.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                            <span className="text-sm font-medium text-slate-700">{item}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveEquipment(index)} className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: Weekly Program */}
            <TabsContent value="program" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
               <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                  {/* Navigator Card */}
                  <Card className="h-fit shadow-sm border-slate-200 bg-slate-50/30 overflow-hidden">
                    <CardHeader className="bg-white border-b py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Program Weeks</CardTitle>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{calculateProgress()}% Done</Badge>
                      </div>
                    </CardHeader>
                    <ScrollArea className="h-[500px]">
                      <div className="p-2 space-y-1">
                        {outline.weeks.map((week, idx) => (
                          <button
                            key={week.id}
                            onClick={() => setSelectedWeekNum(week.weekNumber)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group ${selectedWeekNum === week.weekNumber ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "hover:bg-white hover:shadow-sm"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold border ${selectedWeekNum === week.weekNumber ? "bg-white text-emerald-600 border-white" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                {week.weekNumber}
                              </span>
                              <div>
                                <div className="text-xs font-bold leading-none">Week {week.weekNumber}</div>
                                {outline.startDate && (
                                  <div className={`text-[10px] mt-1 ${selectedWeekNum === week.weekNumber ? "text-emerald-100" : "text-slate-400"}`}>
                                    {getWeekDate(outline.startDate, idx)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {week.tasksContent.length > 20 && <CheckCircle2 className={`w-3 h-3 ${selectedWeekNum === week.weekNumber ? "text-emerald-200" : "text-emerald-500"}`} />}
                              <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-100 ${selectedWeekNum === week.weekNumber ? "" : "text-slate-400"}`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>

                  {/* Editor Content Area */}
                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedWeekNum}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {selectedWeek ? (
                          <Card className="shadow-lg border-emerald-100/50 overflow-hidden">
                            <CardHeader className="bg-slate-50/80 border-b flex flex-row items-center justify-between py-5 px-6">
                              <div>
                                <CardTitle className="text-xl">Week {selectedWeekNum} Detail</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" /> Scheduled for {getWeekDate(outline.startDate, selectedWeekNum - 1)}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleDuplicatePreviousWeek} disabled={selectedWeekNum === 1} className="gap-2 bg-white">
                                  <Copy className="w-3 h-3" /> Duplicate Previous
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleMarkSameAsFirst} disabled={selectedWeekNum === 1} className="gap-2 bg-white">
                                  <Copy className="w-3 h-3" /> From Week 1
                                </Button>
                                <Button 
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm"
                                  onClick={handleAIGenerate}
                                  disabled={isSaving}
                                >
                                  {isSaving ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : <Sparkles className="w-3 h-3" />}
                                  Generate with AI
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                               {outline.style === "Recurring" && (
                                 <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-3">
                                   <Label className="text-amber-800 flex items-center gap-2 font-bold tracking-tight">
                                     <AlertCircle className="w-4 h-4" /> Weekly Variation note
                                   </Label>
                                   <Input 
                                      placeholder="e.g. Lawn Bowls instead of internal lanes"
                                      value={selectedWeek.variationNote || ""}
                                      onChange={e => handleUpdateWeek(selectedWeekNum, { variationNote: e.target.value })}
                                      className="bg-white border-amber-200 focus-visible:ring-amber-500"
                                   />
                                   <p className="text-[10px] text-amber-600 font-medium">Leave blank if standard week. Variations appear on staff dashboards.</p>
                                 </div>
                               )}

                               <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs uppercase font-bold tracking-widest text-slate-500">Goal Progression / Learning Focus</Label>
                                    <Badge variant="outline" className="text-[10px] font-normal border-slate-100">Step {selectedWeekNum} of {outline.durationWeeks}</Badge>
                                  </div>
                                  <Input 
                                    className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-lg font-medium py-6"
                                    placeholder="What is the key goal or focus for this week?"
                                    value={selectedWeek.goalProgression}
                                    onChange={e => handleUpdateWeek(selectedWeekNum, { goalProgression: e.target.value })}
                                  />
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                  <div className="space-y-4">
                                     <Label className="text-xs uppercase font-bold tracking-widest text-slate-500">Tasks & Content Description</Label>
                                     <Textarea 
                                       rows={10}
                                       className="bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 leading-relaxed resize-none"
                                       placeholder="Detailed breakdown of the activity content..."
                                       value={selectedWeek.tasksContent}
                                       onChange={e => handleUpdateWeek(selectedWeekNum, { tasksContent: e.target.value })}
                                     />
                                  </div>
                                  <div className="space-y-8">
                                     <div className="space-y-4">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-2">
                                          <ShieldAlert className="w-4 h-4" /> Staff Facilitation Guide
                                        </Label>
                                        <Textarea 
                                          rows={6}
                                          className="bg-emerald-50/30 border-emerald-100 focus-visible:ring-emerald-500 resize-none italic"
                                          placeholder="How should staff facilitate this? Important safety markers or social prompts..."
                                          value={selectedWeek.staffGuide}
                                          onChange={e => handleUpdateWeek(selectedWeekNum, { staffGuide: e.target.value })}
                                        />
                                        <p className="text-[10px] text-slate-400 italic font-medium">This guide is vital for consistency across rotation staff.</p>
                                     </div>
                                     <div className="grid grid-cols-1 gap-6 pt-4 border-t border-dashed">
                                        <div className="space-y-2">
                                          <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Specific Venue / Location</Label>
                                          <div className="flex gap-2">
                                            <MapPin className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
                                            <Input 
                                              className="bg-slate-50/50 border-slate-100 text-sm h-8"
                                              placeholder="Leave blank for standard"
                                              value={selectedWeek.locationTarget}
                                              onChange={e => handleUpdateWeek(selectedWeekNum, { locationTarget: e.target.value })}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Materials / Extra Week Costs</Label>
                                          <div className="flex gap-2">
                                            <Plus className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
                                            <Input 
                                              className="bg-slate-50/50 border-slate-100 text-sm h-8"
                                              placeholder="$10 for seeds, etc."
                                              value={selectedWeek.materialsCost}
                                              onChange={e => handleUpdateWeek(selectedWeekNum, { materialsCost: e.target.value })}
                                            />
                                          </div>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="bg-slate-50 border-2 border-dashed rounded-xl h-[400px] flex flex-col items-center justify-center p-12 text-center text-slate-400">
                             <History className="w-12 h-12 mb-4 opacity-20" />
                             <p>Select a week from the navigator to begin editing.</p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
               </div>
            </TabsContent>

            {/* TAB: Risks */}
            <TabsContent value="risks" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
               <Card className="shadow-sm border-amber-100/50">
                  <CardHeader className="bg-amber-50/30 border-b border-amber-100/50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-amber-600" /> Hazard Management
                      </CardTitle>
                      <CardDescription>Comprehensive risk assessment for all 24 weeks.</CardDescription>
                    </div>
                    <Button 
                      className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                      onClick={() => navigate(`/activities/outlines/${outline.id}/risk-assessment`)}
                    >
                      <ShieldAlert className="w-4 h-4" /> Start Guided Interview
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/80">
                          <TableHead className="w-1/3">Identified Hazard</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="w-1/3">Controls / Mitigation</TableHead>
                          <TableHead>Responsible</TableHead>
                          <TableHead className="text-right w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outline.risks?.map((risk) => (
                          <TableRow key={risk.id}>
                            <TableCell className="font-medium align-top py-4">
                              <div className="text-sm font-bold text-slate-800">{risk.hazard}</div>
                              <div className="text-xs text-slate-400 mt-1">{risk.likelihood} • {risk.consequence}</div>
                            </TableCell>
                            <TableCell className="align-top py-4">
                              <Badge className={
                                risk.rating === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                risk.rating === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                risk.rating === 'High' ? 'bg-orange-100 text-orange-700' :
                                'bg-rose-100 text-rose-700'
                              }>
                                {risk.rating}
                              </Badge>
                            </TableCell>
                            <TableCell className="align-top py-4">
                               <p className="text-sm text-slate-600 whitespace-pre-wrap">{risk.mitigation}</p>
                            </TableCell>
                            <TableCell className="align-top py-4">
                              <span className="text-xs font-semibold text-slate-500 uppercase">{risk.responsible}</span>
                            </TableCell>
                            <TableCell className="text-right align-top py-3 px-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-slate-300 hover:text-rose-600"
                                 onClick={() => handleDeleteRisk(risk.id)}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!outline.risks || outline.risks.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="py-20 text-center text-slate-400 italic">
                               No risks identified yet. Please complete the guided interview.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* TAB: Closing */}
            <TabsContent value="closing" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Closing Notes & Outcomes</CardTitle>
                      <CardDescription>Summary of expected results and graduation notes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Expected Final Outcomes</Label>
                        <Textarea 
                          rows={6}
                          placeholder="What should participants have achieved by week 12/24?"
                          value={outline.closingNotes || ""}
                          onChange={e => handleUpdateOutline({ closingNotes: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Celebration & Motivation Ideas</Label>
                        <Textarea 
                          rows={4}
                          placeholder="e.g. End of program BBQ, Certificates, Photo album display..."
                          value={outline.celebrationIdeas || ""}
                          onChange={e => handleUpdateOutline({ celebrationIdeas: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm bg-emerald-50/10 border-emerald-100">
                    <CardHeader>
                      <CardTitle className="text-lg">Publishing & Roster Integration</CardTitle>
                      <CardDescription>Make this program available for roster scheduling.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                       <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
                          <div className="space-y-1">
                            <div className="font-bold flex items-center gap-2">
                              {outline.isPublished ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-slate-400" />}
                              Available to Rostering
                            </div>
                            <p className="text-xs text-slate-500">When enabled, this program can be linked to weekly rosters.</p>
                          </div>
                          <Switch 
                             checked={outline.isPublished}
                             onCheckedChange={val => handleUpdateOutline({ isPublished: val })}
                             className="data-[state=checked]:bg-emerald-600"
                          />
                       </div>

                       <div className="p-6 bg-emerald-900 text-white rounded-2xl space-y-4 shadow-xl">
                          <h4 className="font-bold flex items-center gap-2">
                             <Sparkles className="w-5 h-5 text-emerald-300" /> Future Improvements
                          </h4>
                          <p className="text-sm text-emerald-100 mb-4 opacity-80 leading-relaxed">
                             In the Pro version, you can sync this outline with our <strong>Global Program Database</strong> to automatically receive equipment lists, staffing budgets, and NDIS outcome reporting templates.
                          </p>
                          <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white border-none transition-transform hover:scale-[1.02]" variant="secondary">
                             Learn About Global Subscriptions
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
               </div>
            </TabsContent>

            {/* TAB: Preview (Professional View) */}
            <TabsContent value="preview" className="focus-visible:outline-none focus-visible:ring-0">
               <Card className="shadow-2xl border-slate-200 overflow-hidden bg-white max-w-5xl mx-auto min-h-[1000px]">
                  <div className="p-12 md:p-20 space-y-20">
                     {/* Doc Header */}
                     <div className="flex justify-between items-start border-b-2 border-slate-900 pb-12">
                        <div className="space-y-6 max-w-2xl">
                          <Badge className="bg-emerald-600 text-white px-4 py-1 text-xs tracking-widest font-bold uppercase rounded-none">Program Documentation</Badge>
                          <h1 className="text-6xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">{outline.title}</h1>
                          <div className="flex flex-wrap gap-8 text-sm pt-4">
                             <div>
                               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Program Style</div>
                               <div className="font-bold text-slate-800">{outline.style} ({outline.durationWeeks} Weeks)</div>
                             </div>
                             <div>
                               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Scheduled Day</div>
                               <div className="font-bold text-slate-800">{outline.dayOfWeek} • {outline.startTime}-{outline.endTime}</div>
                             </div>
                             <div>
                               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Standard Ratio</div>
                               <div className="font-bold text-slate-800">{outline.staffRatio} Support</div>
                             </div>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className="text-5xl font-black text-emerald-600 opacity-20 select-none">DE-V1</div>
                           <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Org Reference: {outline.id.split('-')[0].toUpperCase()}</div>
                        </div>
                     </div>

                     {/* Program Sections */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                           <h2 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-emerald-600 pl-4">Logistics Summary</h2>
                           <div className="space-y-6">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-slate-100 flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-slate-400" /></div>
                                 <div className="space-y-1">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</div>
                                    <div className="text-sm font-medium text-slate-700">{outline.locationDescription || "To be confirmed."}</div>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-slate-100 flex items-center justify-center shrink-0"><Truck className="w-5 h-5 text-slate-400" /></div>
                                 <div className="space-y-1">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transport Arrangement</div>
                                    <div className="text-sm font-medium text-slate-700">{outline.transportNotes || "Standard organization transport applies."}</div>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 bg-slate-100 flex items-center justify-center shrink-0"><DollarSign className="w-5 h-5 text-slate-400" /></div>
                                 <div className="space-y-1">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Participation Cost</div>
                                    <div className="text-sm font-medium text-slate-700">{outline.standardCost || "Refer to service agreement."}</div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <h2 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-emerald-600 pl-4">Equipment & Materials</h2>
                           <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                              {outline.equipment.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                   {item}
                                </div>
                              ))}
                              {outline.equipment.length === 0 && <div className="text-sm italic text-slate-400">No specific equipment listed.</div>}
                           </div>
                        </div>
                     </div>

                     {/* Daily Flow */}
                     <div className="space-y-10">
                        <h2 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-emerald-600 pl-4 text-slate-900">Standard Daily Flow</h2>
                        <div className="bg-slate-50 p-1 rounded-sm border border-slate-200">
                           <Table>
                             <TableHeader>
                               <TableRow className="border-b border-slate-200 hover:bg-transparent">
                                 <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 bg-white">Time</TableHead>
                                 <TableHead className="font-black uppercase tracking-widest text-[10px] text-slate-400 bg-white">Activity / Phase</TableHead>
                               </TableRow>
                             </TableHeader>
                             <TableBody>
                               {outline.timeline.map(item => (
                                 <TableRow key={item.id} className="border-b border-slate-100 hover:bg-emerald-50 transition-colors">
                                   <TableCell className="font-black text-slate-900 py-4 w-40">{item.time}</TableCell>
                                   <TableCell className="font-medium text-slate-600 py-4">{item.activity}</TableCell>
                                 </TableRow>
                               ))}
                             </TableBody>
                           </Table>
                        </div>
                     </div>

                     {/* Weekly Progression Overview */}
                     <div className="space-y-8 pt-10 border-t break-before-page">
                        <div className="flex items-center justify-between">
                           <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 italic">{outline.durationWeeks}-Week Program Progression</h2>
                           <Badge variant="outline" className="border-emerald-600 text-emerald-600 font-bold px-4">{outline.durationWeeks} Weeks</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 grid-flow-row-dense">
                           {outline.weeks.map((week, idx) => (
                             <div key={week.id} className="border p-6 space-y-4 hover:bg-slate-50 transition-colors group relative h-[320px] overflow-hidden flex flex-col justify-between">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                     <span className="text-4xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors leading-none tracking-tighter">#{week.weekNumber}</span>
                                     {week.variationNote && <Badge className="bg-amber-100 text-amber-800 text-[9px] uppercase font-black tracking-widest">Variation</Badge>}
                                  </div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2 mb-2">{week.goalProgression || "Focus TBA"}</div>
                                  <p className="text-sm font-medium text-slate-700 leading-relaxed line-clamp-4">{week.tasksContent || "Content pending facilitation design."}</p>
                                </div>
                                <div className="space-y-2">
                                  {week.staffGuide && (
                                    <div className="text-[10px] italic text-emerald-700 bg-emerald-50/50 p-2 border-l-2 border-emerald-500 rounded-sm">
                                      Guide: {week.staffGuide.substring(0, 100)}{week.staffGuide.length > 100 ? '...' : ''}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-4">
                                    <span className="text-[9px] font-bold uppercase text-slate-300">Phase: {Math.ceil(idx / (outline.durationWeeks / 4))}</span>
                                    <span className="text-[9px] font-bold text-slate-300 italic">{getWeekDate(outline.startDate, idx)}</span>
                                  </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* Risk Assessment Page */}
                     <div className="mt-20 pt-20 border-t-2 border-slate-900 break-before-page">
                        <div className="flex items-center justify-between mb-12">
                          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Safety & Risk Management</h2>
                          <div className="text-right">
                             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reviewed At</div>
                             <div className="font-black text-slate-900">{new Date().toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="border shadow-sm rounded-none overflow-hidden">
                           <Table>
                             <TableHeader className="bg-slate-900">
                               <TableRow className="hover:bg-slate-900 border-none">
                                 <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-200 py-6">Hazard / Risk</TableHead>
                                 <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-200 py-6">Rating</TableHead>
                                 <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-200 py-6">Control / Mitigation Strategies</TableHead>
                                 <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-200 py-6">Responsible</TableHead>
                               </TableRow>
                             </TableHeader>
                             <TableBody>
                               {outline.risks?.map(risk => (
                                 <TableRow key={risk.id} className="border-b last:border-none">
                                   <TableCell className="align-top py-8 w-1/4">
                                      <div className="font-black text-slate-800 text-base">{risk.hazard}</div>
                                      <div className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">{risk.likelihood} • {risk.consequence}</div>
                                   </TableCell>
                                   <TableCell className="align-top py-8">
                                      <div className={`text-xs font-black uppercase tracking-widest px-3 py-1 inline-block ${
                                        risk.rating === 'Extreme' ? 'bg-rose-500 text-white shadow-lg' :
                                        risk.rating === 'High' ? 'bg-orange-500 text-white' :
                                        risk.rating === 'Medium' ? 'bg-amber-400 text-slate-900' :
                                        'bg-emerald-500 text-white'
                                      }`}>
                                        {risk.rating}
                                      </div>
                                   </TableCell>
                                   <TableCell className="align-top py-8 w-1/3">
                                      <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-wrap">{risk.mitigation}</p>
                                   </TableCell>
                                   <TableCell className="align-top py-8">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-emerald-300 pb-1">{risk.responsible}</span>
                                   </TableCell>
                                 </TableRow>
                               ))}
                               {(!outline.risks || outline.risks.length === 0) && (
                                 <TableRow>
                                   <TableCell colSpan={4} className="py-20 text-center text-slate-400 italic font-medium">
                                      No risks identified in this version of the program.
                                   </TableCell>
                                 </TableRow>
                               )}
                             </TableBody>
                           </Table>
                        </div>
                     </div>
                  </div>
               </Card>
               {/* Fixed Preview Footer */}
               <div className="max-w-5xl mx-auto mt-6 flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                     <span className="text-emerald-400">Total Program Scope: {outline.durationWeeks} Weeks</span>
                     <span className="opacity-30">|</span>
                     <span>Facilitator: {user?.name || "System Admin"}</span>
                  </div>
                  <div className="flex gap-3">
                     <Button variant="ghost" className="text-white hover:bg-white/10 uppercase font-bold text-[10px] tracking-widest">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                     </Button>
                     <Button variant="ghost" className="text-white hover:bg-white/10 uppercase font-bold text-[10px] tracking-widest">
                        <Share2 className="w-4 h-4 mr-2" /> Export to Portal
                     </Button>
                  </div>
               </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Sidebar Widgets */}
        <div className="space-y-6">
          <AnimatePresence>
            {isAiPanelOpen && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="xl:fixed xl:right-8 xl:top-32 xl:bottom-8 xl:w-[400px] z-50 pointer-events-auto"
              >
                <Card className="h-full border-indigo-100 shadow-2xl flex flex-col bg-white">
                  <CardHeader className="bg-indigo-600 text-white rounded-t-xl py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-indigo-100" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">AI Assistant</CardTitle>
                          <CardDescription className="text-indigo-100/70 text-[10px]">Context-Aware Prompt Generator</CardDescription>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsAiPanelOpen(false)}
                        className="text-white hover:bg-white/10"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto p-6 space-y-6">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">What do you need help with?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'full', label: 'Full Outline', icon: ClipboardList },
                          { id: 'specific', label: 'Current Week', icon: CalendarDays },
                          { id: 'guide', label: 'Staff Guide', icon: ShieldAlert },
                          { id: 'timeline', label: 'Activity Flow', icon: Clock },
                          { id: 'materials', label: 'Materials', icon: Truck }
                        ].map((btn) => (
                          <Button
                            key={btn.id}
                            variant={promptType === btn.id ? 'default' : 'outline'}
                            className={`justify-start gap-2 h-auto py-3 text-xs ${promptType === btn.id ? 'bg-indigo-600' : 'border-slate-100'}`}
                            onClick={() => setPromptType(btn.id as any)}
                          >
                            <btn.icon className="w-3 h-3 shrink-0" />
                            {btn.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">The Generated Prompt</Label>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px]">Context Ready</Badge>
                      </div>
                      <div className="relative group">
                        <Textarea 
                          readOnly
                          value={generatedPrompt}
                          className="min-h-[250px] text-[11px] leading-relaxed bg-slate-50 font-mono border-slate-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity" />
                      </div>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg gap-2" onClick={handleCopyPrompt}>
                        <Copy className="w-4 h-4" /> Copy Prompt for LLM
                      </Button>
                      <p className="text-[10px] text-slate-400 text-center italic">Paste this into ChatGPT, Claude, or Grok for best results.</p>
                    </div>

                    <div className="pt-6 border-t border-dashed">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Got result from AI?</Label>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 border-indigo-100 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50"
                        onClick={() => setIsImporting(true)}
                      >
                        <Download className="w-4 h-4" /> Import Response back
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 py-4 border-t text-[10px] text-slate-500 flex items-center gap-2">
                    <Info className="w-3 h-3 text-indigo-400" />
                    Our system uses your current outline text to build these prompts automatically.
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-sm">Global Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                 <div className="space-y-0.5">
                    <div className="text-xs font-bold">Program Visibility</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{outline.isPublished ? "Visible to Roster" : "Private Draft"}</div>
                 </div>
                 <Switch 
                   checked={outline.isPublished}
                   onCheckedChange={val => handleUpdateOutline({ isPublished: val })}
                   className="data-[state=checked]:bg-emerald-600"
                 />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 px-1">
                   <span>Completion</span>
                   <span>{calculateProgress()}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${calculateProgress()}%` }}
                   />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
               <Sparkles className="w-20 h-20 text-white" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-white text-lg">AI Program Sync</CardTitle>
              <CardDescription className="text-slate-400">Load template or update using AI</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect this outline to the <strong>Activity Hub</strong> to fetch high-performing curriculum templates and evidence-based goals.
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg gap-2" size="sm">
                <Sparkles className="w-3 h-3" /> Fetch Template
              </Button>
              <Button variant="outline" className="w-full text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white" size="sm">
                Update with AI Suggest
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
             <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
               <Info className="w-4 h-4" /> Pro Tip
             </h4>
             <p className="text-[11px] text-emerald-700 leading-relaxed">
               Duplicate week settings to maintain a core rhythm for <span className="font-bold">Recurring</span> programs, then just add <span className="font-bold">Variations</span> for special events.
             </p>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {isImporting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsImporting(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-indigo-600" /> Import AI Response
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Paste the response from ${outline.title} generation here.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsImporting(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Response Text</Label>
                  <Textarea 
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder="Paste the LLM's text here... (looking for 'WEEK X:' markers)"
                    className="min-h-[400px] leading-relaxed text-sm bg-slate-50 border-slate-200"
                  />
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-700">
                      <strong>Tip:</strong> Ensure the AI's response uses "WEEK 1:", "WEEK 2:" style headers so I can correctly map the content to your program structure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" className="flex-1" onClick={() => setIsImporting(false)}>Cancel</Button>
                  <Button className="flex-[2] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 gap-2" onClick={handleImportFromAI}>
                    Analyze & Apply to Program
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortableTimelineRow({ 
  item, 
  onUpdate, 
  onRemove 
}: { 
  item: TimelineEvent; 
  onUpdate: (id: string, updates: Partial<TimelineEvent>) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={`group ${isDragging ? "bg-emerald-50 shadow-inner" : ""}`}
    >
      <TableCell className="py-2">
        <button 
          className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500"
          {...attributes}
          {...listeners}
        >
          <Settings className="w-4 h-4 rotate-90" />
        </button>
      </TableCell>
      <TableCell className="py-2">
        <Input 
          value={item.time} 
          onChange={e => onUpdate(item.id, { time: e.target.value })}
          placeholder="9:30 AM"
          className="border-none bg-transparent h-8 focus-visible:ring-emerald-500 font-medium"
        />
      </TableCell>
      <TableCell className="py-2">
        <Input 
          value={item.activity} 
          onChange={e => onUpdate(item.id, { activity: e.target.value })}
          placeholder="Describe the activity block"
          className="border-none bg-transparent h-8 focus-visible:ring-emerald-500 font-medium"
        />
      </TableCell>
      <TableCell className="py-2 text-right">
        <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} className="h-8 w-8 text-slate-300 hover:text-rose-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

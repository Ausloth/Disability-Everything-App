import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useStore, JournalNote } from "@/store/useStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Save,
  Check,
  FileText,
  User,
  Tag,
  Activity,
  AlertTriangle,
  History,
  Copy,
  Sparkles,
  RefreshCw,
  Paperclip,
  PhoneCall,
  Mail,
  Users,
} from "lucide-react";

const NOTE_TYPES = [
  "Activity / Session Note",
  "Family / Support Network Communication",
  "Internal Team Communication / Handover",
  "Document / Administration Update",
  "Financial Query or Transaction Note",
  "Appointment / External Provider Attendance",
  "Incident / Behaviour / Medication Note",
  "Goal Review / Progress Note",
  "Other",
];

interface JournalFormData {
  name: string;
  // Activity
  activity: string;
  location: string;
  timeType: string;
  environment: string;
  ratio: string;
  specificActivity: string;
  mood: string;
  minorBehavior: string;
  goal: string;
  goalProgression: string;
  activityReflection: string;

  // Communication
  commMethod: string;
  commContactType: string;
  commContactName: string;
  commRegarding: string;
  commDiscussion: string;
  commOutcome: string;

  // Incident
  incId: string;
  incType: string;
  incLocation: string;
  incAntecedent: string;
  incBehavior: string;
  incIntervention: string;
  incOutcome: string;

  // General
  genContext: string;
  genDetails: string;
  genAction: string;
}

const INITIAL_FORM_DATA: JournalFormData = {
  name: "",
  // Activity
  activity: "",
  location: "",
  timeType: "Morning",
  environment: "",
  ratio: "",
  specificActivity: "",
  mood: "",
  minorBehavior: "",
  goal: "",
  goalProgression: "",
  activityReflection: "",

  // Communication
  commMethod: "Called",
  commContactType: "Family Member",
  commContactName: "",
  commRegarding: "",
  commDiscussion: "",
  commOutcome: "",

  // Incident
  incId: "",
  incType: "Behavioral",
  incLocation: "",
  incAntecedent: "",
  incBehavior: "",
  incIntervention: "",
  incOutcome: "",

  // General
  genContext: "",
  genDetails: "",
  genAction: "",
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const ensurePeriod = (s: string) => {
  if (!s) return "";
  const trimmed = s.trim();
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
};

const getCategory = (t: string) => {
  if (t === "Activity / Session Note") return "activity";
  if (t.includes("Communication") || t.includes("Appointment")) return "comm";
  if (t.includes("Incident")) return "incident";
  return "general";
};

const generateJournalText = (
  noteType: string,
  data: JournalFormData,
  selectedClientNames: string[],
): string => {
  const category = getCategory(noteType);
  const clientName =
    data.name ||
    (selectedClientNames.length > 0
      ? selectedClientNames.join(" and ")
      : "[Client Name]");

  if (category === "activity") {
    const {
      activity,
      location,
      timeType,
      environment,
      goal,
      goalProgression,
      ratio,
      specificActivity,
      mood,
      minorBehavior,
      activityReflection,
    } = data;

    const journalParts: string[] = [];

    // --- SECTION 1: CONTEXT ---
    let contextSentence = "";
    if (timeType === "Morning")
      contextSentence += "During the morning session, ";
    else if (timeType === "Afternoon")
      contextSentence += "During the afternoon session, ";
    else if (timeType === "All Day") contextSentence += "Throughout the day, ";
    else contextSentence += "Today, ";

    contextSentence += `${clientName} `;

    const act = activity ? activity.toLowerCase() : "scheduled activities";

    if (location === "Community" || location === "Offsite") {
      contextSentence += `accessed the community for ${act}`;
    } else if (location === "Onsite" || location === "Centre") {
      contextSentence += `participated in ${act} at the centre`;
    } else {
      contextSentence += `participated in ${act}`;
      if (location) contextSentence += ` (${location})`;
    }
    journalParts.push(ensurePeriod(contextSentence));

    // --- SECTION 2: ENVIRONMENT & SUPPORT ---
    if (environment) {
      journalParts.push(
        `The session took place in a ${environment.toLowerCase()} environment.`,
      );
    }

    let supportSentence = "";
    if (ratio) {
      if (ratio.includes(":"))
        supportSentence += `${clientName} was supported at a ${ratio} ratio`;
      else
        supportSentence += `${clientName} received ${ratio.toLowerCase()} support`;
      journalParts.push(ensurePeriod(supportSentence));
    }

    // --- SECTION 3: NARRATIVE & MOOD ---
    if (specificActivity) {
      const trimmed = specificActivity.trim();
      const lower = trimmed.toLowerCase();
      if (
        lower.startsWith(clientName.toLowerCase()) ||
        lower.startsWith("he ") ||
        lower.startsWith("she ") ||
        lower.startsWith("they ")
      ) {
        journalParts.push(ensurePeriod(trimmed));
      } else {
        journalParts.push(ensurePeriod(`${clientName} ${lower}`));
      }
    }

    if (mood) {
      const m = mood;
      if (m === "Calm")
        journalParts.push(
          `${clientName} appeared calm and content throughout.`,
        );
      else if (m === "Positive")
        journalParts.push(`${clientName} appeared happy and enthusiastic.`);
      else if (m === "Anxious")
        journalParts.push("Signs of anxiety or nervousness were observed.");
      else if (m === "Fatigued")
        journalParts.push(
          `${clientName} appeared fatigued with low energy levels.`,
        );
      else if (m === "Focused")
        journalParts.push("Focus and engagement levels were high.");
      else journalParts.push(`Mood was observed as ${m.toLowerCase()}.`);
    }

    // --- SECTION 4: BEHAVIOR ---
    if (minorBehavior) {
      switch (minorBehavior) {
        case "Cooperative":
          journalParts.push(
            "Behavior was cooperative and direction was followed well.",
          );
          break;
        case "Distracted":
          journalParts.push(
            `${clientName} was easily distracted and required occasional prompts to stay on task.`,
          );
          break;
        case "Minor agitation":
          journalParts.push(
            "Episodes of mild agitation were noted but managed with standard support.",
          );
          break;
        case "Refusal":
          journalParts.push(
            "There were instances of task refusal during the session.",
          );
          break;
      }
    }

    // --- SECTION 5: GOALS ---
    if (goal) {
      journalParts.push(
        ensurePeriod(
          `The primary timeframe goal was related to ${goal.toLowerCase()}`,
        ),
      );
    }

    if (goalProgression) {
      const lower = goalProgression.toLowerCase();
      if (
        lower.startsWith(clientName.toLowerCase()) ||
        lower.startsWith("he ") ||
        lower.startsWith("she ")
      ) {
        journalParts.push(ensurePeriod(goalProgression));
      } else {
        journalParts.push(
          ensurePeriod(`Regarding this goal, ${clientName} ${lower}`),
        );
      }
    }

    // --- SECTION 6: REFLECTION ---
    if (activityReflection) {
      journalParts.push(ensurePeriod(activityReflection));
    }

    return journalParts.join(" ");
  } else if (category === "comm") {
    const p: string[] = [];
    const method = data.commMethod || "Contacted";
    let type = data.commContactType || "the relevant party";
    if (type === "Family Member") type = "family member";

    const nm = data.commContactName ? ` (${data.commContactName})` : "";

    let lead = "";
    if (method === "Met with" || method === "In-person meeting with") {
      lead = `${method} ${type}${nm} regarding ${clientName}`;
    } else {
      lead = `${method} ${type}${nm} regarding ${clientName}`;
    }

    if (data.commRegarding) lead += ` to discuss ${data.commRegarding}.`;
    else lead += `.`;
    p.push(ensurePeriod(lead));

    if (data.commDiscussion) {
      p.push(`Discussion Details:\n${data.commDiscussion}`);
    }

    if (data.commOutcome) {
      p.push(`Outcome / Next Steps:\n${data.commOutcome}`);
    }

    return p.join("\n\n");
  } else if (category === "incident") {
    const p: string[] = [];
    const baseTitle = `Incident Report: ${data.incType || "General"} Incident involving ${clientName}`;
    p.push(data.incId ? `${baseTitle} (Ref: ${data.incId})` : baseTitle);

    if (data.incLocation) p.push(`Location: ${data.incLocation}`);

    if (data.incAntecedent)
      p.push(`Antecedent (Before):\n${data.incAntecedent}`);
    if (data.incBehavior)
      p.push(`Behavior / Event Details:\n${data.incBehavior}`);
    if (data.incIntervention)
      p.push(`Intervention Given / Actions Taken:\n${data.incIntervention}`);
    if (data.incOutcome) p.push(`Outcome / Status:\n${data.incOutcome}`);

    return p.join("\n\n");
  } else {
    // General
    const p: string[] = [];
    if (data.genContext) {
      p.push(`Context / Event:\n${data.genContext}`);
    }
    if (data.genDetails) {
      p.push(`Details / Observations:\n${data.genDetails}`);
    }
    if (data.genAction) {
      p.push(`Next Steps / Actions:\n${data.genAction}`);
    }
    return p.join("\n\n");
  }
};

export function JournalTool() {
  const {
    user,
    schedules,
    activities,
    outlines,
    clients,
    addJournalNote,
    notes,
  } = useStore();
  const location = useLocation();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  // Note Form State
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [time, setTime] = useState<string>(
    new Date().toTimeString().substring(0, 5),
  );
  const [noteType, setNoteType] = useState<string>(NOTE_TYPES[0]);
  const [customType, setCustomType] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  // Structured form data
  const [formData, setFormData] = useState<JournalFormData>(INITIAL_FORM_DATA);

  // Staging / Final Text Control
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [finalContent, setFinalContent] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  // Barriers specific to activity notes
  const [barriers, setBarriers] = useState({
    physical: "",
    sensory: "",
    cognitive: "",
    social: "",
    strategies: "",
    impact: "" as "Low" | "Medium" | "High" | "",
  });

  // Derived Values
  const category = getCategory(noteType);
  const selectedClientNames = clients
    .filter((c) => selectedClientIds.includes(c.id))
    .map((c) => c.name);

  // Auto-generate text
  const autoGeneratedText = useMemo(() => {
    return generateJournalText(noteType, formData, selectedClientNames);
  }, [noteType, formData, selectedClientNames]);

  // Keep finalContent in sync with generated text UNLESS user explicitly edited it
  useEffect(() => {
    if (!isManuallyEdited) {
      setFinalContent(autoGeneratedText);
    }
  }, [autoGeneratedText, isManuallyEdited]);

  // Try to pre-fill from query params if coming from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get("scheduleId");
    if (sid) {
      setSelectedScheduleId(sid);
      setNoteType("Activity / Session Note");
      const selSched = schedules.find((s) => s.id === sid);
      if (selSched) {
        // Auto-select clients from schedule
        const clientIds = clients
          .filter((c) => selSched.clients.includes(c.name))
          .map((c) => c.id);
        setSelectedClientIds(clientIds);
      }
    }
  }, [location, schedules, clients]);

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const activityContext = selectedSchedule
    ? activities.find((a) => a.id === selectedSchedule.activityId)
    : null;
  const outlineContext = selectedSchedule
    ? outlines.find((o) => o.id === selectedSchedule.outlineId)
    : null;
  const weekContext =
    outlineContext && selectedSchedule
      ? outlineContext.weeks.find(
          (w) => w.weekNumber === selectedSchedule.currentWeek,
        )
      : null;

  const handleInputChange = (field: keyof JournalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextClient = () => {
    setFormData((prev) => ({
      ...INITIAL_FORM_DATA,
      // Retain Activity context
      activity: prev.activity,
      location: prev.location,
      timeType: prev.timeType,
      environment: prev.environment,
      ratio: prev.ratio,
      goal: prev.goal,
      // Retain General context
      genContext: prev.genContext,
    }));
    setIsManuallyEdited(false);
    setBarriers({
      physical: "",
      sensory: "",
      cognitive: "",
      social: "",
      strategies: "",
      impact: "",
    });
  };

  // Aggregate goals for selected clients
  const availableGoals = clients
    .filter((c) => selectedClientIds.includes(c.id))
    .flatMap((c) => (c.goals || []).map((g) => ({ ...g, clientName: c.name })));

  const toggleClient = (id: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    // Unlink goals that no longer belong to selected clients
    setSelectedGoalIds([]);

    // Helpfully update the form name if it's empty
    const clientObj = clients.find((c) => c.id === id);
    if (clientObj && !formData.name && selectedClientIds.length === 0) {
      handleInputChange("name", clientObj.name);
    }
  };

  const toggleGoal = (id: string) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    if (!user) return;

    const newNote: JournalNote = {
      id: crypto.randomUUID(),
      timestamp: `${date}T${time}:00Z`,
      staffId: user.id,
      clientIds: selectedClientIds,
      noteType: noteType === "Other" ? customType : noteType,
      subject: subject || `${noteType} for ${selectedClientNames.join(", ")}`,
      content: finalContent,
      linkedGoalIds: selectedGoalIds,
    };

    if (category === "activity" && selectedSchedule) {
      newNote.scheduleId = selectedSchedule.id;
      newNote.activityId = selectedSchedule.activityId;
      newNote.outlineId = selectedSchedule.outlineId;
      newNote.currentWeek = selectedSchedule.currentWeek;
      newNote.barriers = barriers;
    }

    addJournalNote(newNote);
    alert("Note saved to client profiles successfully!");

    // Reset core
    setSubject("");
    setFinalContent("");
    setIsManuallyEdited(false);

    // Clear dynamic narrative fields but leave base settings
    setFormData((prev) => ({
      ...INITIAL_FORM_DATA,
      activity: prev.activity,
      location: prev.location,
      timeType: prev.timeType,
      environment: prev.environment,
    }));

    setBarriers({
      physical: "",
      sensory: "",
      cognitive: "",
      social: "",
      strategies: "",
      impact: "",
    });
    setSelectedGoalIds([]);
  };

  const recentNotes = notes
    .filter((n) => n.staffId === user?.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-400">
          Documentation & Notes
        </h1>
        <p className="text-muted-foreground mt-2">
          Log progress, incidents, communication, and session notes directly to
          client files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/30">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                New Note Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Note Type</Label>
                  <select
                    value={noteType}
                    onChange={(e) => {
                      setNoteType(e.target.value);
                      setIsManuallyEdited(false);
                    }}
                    className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md p-2 h-10"
                  >
                    {NOTE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                {noteType === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Note Type</Label>
                    <Input
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="e.g. Transport Log"
                      className="h-10"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Subject / Title (Optional)</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="font-medium h-10"
                  />
                </div>
              </div>

              {category === "activity" && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                      <Activity className="w-4 h-4 text-indigo-500" /> Session
                      Context
                    </div>
                  </div>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm px-3 py-2 shadow-sm"
                  >
                    <option value="">-- Link to a scheduled session --</option>
                    {schedules.map((s) => {
                      const act = activities.find((a) => a.id === s.activityId);
                      return (
                        <option key={s.id} value={s.id}>
                          {act?.name} ({s.time})
                        </option>
                      );
                    })}
                  </select>

                  {selectedSchedule && activityContext && (
                    <div className="flex flex-col gap-3 mt-3">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 py-2 px-3 rounded-md">
                        Linked to Week {selectedSchedule.currentWeek} of{" "}
                        {activityContext.name}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />{" "}
                        Insert Context Chips
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleInputChange("activity", activityContext.name)
                          }
                          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-950 border shadow-sm hover:border-indigo-400 transition-colors flex items-center gap-1.5"
                        >
                          <Activity className="w-3 h-3 text-indigo-500" />{" "}
                          {activityContext.name}
                        </button>
                        <button
                          onClick={() =>
                            handleInputChange(
                              "location",
                              activityContext.category === "Outdoors"
                                ? "Community"
                                : "Onsite",
                            )
                          }
                          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-950 border shadow-sm hover:border-indigo-400 transition-colors"
                        >
                          📍{" "}
                          {activityContext.category === "Outdoors"
                            ? "Community"
                            : "Onsite"}
                        </button>
                        {weekContext && (
                          <button
                            onClick={() =>
                              handleInputChange(
                                "goal",
                                weekContext.goalProgression,
                              )
                            }
                            className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-950 border shadow-sm hover:border-indigo-400 transition-colors flex items-center gap-1.5 truncate max-w-[200px]"
                            title={weekContext.goalProgression}
                          >
                            <Tag className="w-3 h-3 text-emerald-500 shrink-0" />{" "}
                            {weekContext.goalProgression}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500 py-1.5">
                          Clients in Session:
                        </span>
                        {selectedSchedule.clients.map((clientName, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleInputChange("name", clientName)
                            }
                            className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.name === clientName ? "bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300" : "bg-white dark:bg-slate-950 hover:border-indigo-400"}`}
                          >
                            <User className="w-3 h-3 opacity-70" /> {clientName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Clients & Goals linking common to ALL types */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Linked Clients (Required to save to client files)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => toggleClient(client.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${selectedClientIds.includes(client.id) ? "bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300" : "bg-white dark:bg-slate-950 hover:border-indigo-400"}`}
                      >
                        <User className="w-3 h-3 opacity-70" /> {client.name}
                      </button>
                    ))}
                  </div>
                </div>

                {availableGoals.length > 0 && (
                  <div className="space-y-2 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    <Label className="text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Link Evidence to Client Goals
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableGoals.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`text-[11px] px-2.5 py-1 rounded border shadow-sm transition-colors text-left flex items-start gap-1.5 max-w-[300px] ${selectedGoalIds.includes(goal.id) ? "bg-emerald-200 border-emerald-400 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100" : "bg-white border-emerald-200 dark:bg-slate-950"}`}
                        >
                          <Tag className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                          <span className="truncate">
                            {goal.clientName}: {goal.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DYNAMIC BUILDERS */}
              <div className="space-y-6 pt-2">
                <div className="pb-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" /> Structure
                    Builder
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Fill out the fields below, or use the fast chips to
                    construct the note in the Staging Area.
                  </p>
                </div>

                {category === "activity" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/20 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-2">
                      <Label>Primary Subject / Client Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="e.g. John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Activity / Focus</Label>
                      <Input
                        value={formData.activity}
                        onChange={(e) =>
                          handleInputChange("activity", e.target.value)
                        }
                        placeholder="e.g. Bowling"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location Setting</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Onsite", "Community", "In-Home", "Transport"].map(
                          (m) => (
                            <button
                              key={m}
                              onClick={() => handleInputChange("location", m)}
                              className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.location === m ? "bg-indigo-100 border-indigo-300 text-indigo-900" : "bg-white dark:bg-slate-950 hover:border-indigo-400 text-slate-700 dark:text-slate-200"}`}
                            >
                              {m}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Session Time</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Morning", "Afternoon", "All Day", "Evening"].map(
                          (m) => (
                            <button
                              key={m}
                              onClick={() => handleInputChange("timeType", m)}
                              className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.timeType === m ? "bg-indigo-100 border-indigo-300 text-indigo-900" : "bg-white dark:bg-slate-950 hover:border-indigo-400 text-slate-700 dark:text-slate-200"}`}
                            >
                              {m}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Specific Participation / Actions</Label>
                      <Textarea
                        rows={2}
                        value={formData.specificActivity}
                        onChange={(e) =>
                          handleInputChange("specificActivity", e.target.value)
                        }
                        placeholder="e.g. engaged strongly with the art project, taking time to choose colours."
                        className="bg-white dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Overall Mood</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Calm",
                          "Positive",
                          "Anxious",
                          "Fatigued",
                          "Focused",
                          "Regulated",
                          "Dysregulated",
                        ].map((m) => (
                          <button
                            key={m}
                            onClick={() => handleInputChange("mood", m)}
                            className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.mood === m ? "bg-indigo-100 border-indigo-300 text-indigo-900" : "bg-white dark:bg-slate-950 hover:border-indigo-400 text-slate-700 dark:text-slate-200"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Behavior / Engagement</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Cooperative",
                          "Distracted",
                          "Minor agitation",
                          "Refusal",
                          "Highly Engaged",
                          "Withdrawn",
                        ].map((m) => (
                          <button
                            key={m}
                            onClick={() =>
                              handleInputChange("minorBehavior", m)
                            }
                            className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.minorBehavior === m ? "bg-indigo-100 border-indigo-300 text-indigo-900" : "bg-white dark:bg-slate-950 hover:border-indigo-400 text-slate-700 dark:text-slate-200"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Progress Toward Goals</Label>
                      <Textarea
                        rows={2}
                        value={formData.goalProgression}
                        onChange={(e) =>
                          handleInputChange("goalProgression", e.target.value)
                        }
                        placeholder={`e.g. actively participated in group discussions, fulfilling social goals.`}
                        className="bg-white dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Closing Reflection / Next Steps</Label>
                      <Input
                        value={formData.activityReflection}
                        onChange={(e) =>
                          handleInputChange(
                            "activityReflection",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Will offer more sensory breaks next week."
                        className="bg-white dark:bg-slate-950 h-10"
                      />
                    </div>
                  </div>
                )}

                {category === "comm" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="space-y-2">
                      <Label>Method of Communication</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Called", "Emailed", "Messaged", "Met with"].map(
                          (m) => (
                            <button
                              key={m}
                              onClick={() => handleInputChange("commMethod", m)}
                              className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.commMethod === m ? "bg-blue-200 border-blue-300 text-blue-900" : "bg-white hover:border-blue-400"}`}
                            >
                              <PhoneCall className="w-3 h-3 opacity-70" /> {m}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Family Member",
                          "Support Coordinator",
                          "Therapist",
                          "Medical Professional",
                          "Teacher / School",
                          "Internal Team Member",
                        ].map((m) => (
                          <button
                            key={m}
                            onClick={() =>
                              handleInputChange("commContactType", m)
                            }
                            className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.commContactType === m ? "bg-blue-200 border-blue-300 text-blue-900" : "bg-white hover:border-blue-400 text-slate-700"}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Name (Optional)</Label>
                      <Input
                        value={formData.commContactName}
                        onChange={(e) =>
                          handleInputChange("commContactName", e.target.value)
                        }
                        placeholder="e.g. Mary Smith"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Regarding / Topic</Label>
                      <Input
                        value={formData.commRegarding}
                        onChange={(e) =>
                          handleInputChange("commRegarding", e.target.value)
                        }
                        placeholder="e.g. upcoming schedule changes"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Discussion Details</Label>
                      <Textarea
                        rows={3}
                        value={formData.commDiscussion}
                        onChange={(e) =>
                          handleInputChange("commDiscussion", e.target.value)
                        }
                        placeholder="What was discussed?"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Outcome / Next Steps</Label>
                      <Textarea
                        rows={2}
                        value={formData.commOutcome}
                        onChange={(e) =>
                          handleInputChange("commOutcome", e.target.value)
                        }
                        placeholder="Are there any actions to take?"
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}

                {category === "incident" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Incident Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Behavioral",
                          "Medical",
                          "Medication Error",
                          "Medication Refusal",
                          "Environmental",
                          "Staff/Workplace",
                          "Near Miss",
                          "Other",
                        ].map((m) => (
                          <button
                            key={m}
                            onClick={() => handleInputChange("incType", m)}
                            className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.incType === m ? "bg-red-200 border-red-300 text-red-900" : "bg-white hover:border-red-400 text-slate-700"}`}
                          >
                            <AlertTriangle className="w-3 h-3 opacity-70" /> {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Incident ID / Ref (External)</Label>
                      <Input
                        value={formData.incId}
                        onChange={(e) =>
                          handleInputChange("incId", e.target.value)
                        }
                        placeholder="e.g. INC-2023-001"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location / Setting</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Centre / Onsite",
                            "Community",
                            "Vehicle",
                            "Client Home",
                            "Public Transport",
                          ].map((loc) => (
                            <button
                              key={loc}
                              onClick={() =>
                                handleInputChange("incLocation", loc)
                              }
                              className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.incLocation === loc ? "bg-red-200 border-red-300 text-red-900" : "bg-white hover:border-red-400 text-slate-700"}`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                        <Input
                          value={formData.incLocation}
                          onChange={(e) =>
                            handleInputChange("incLocation", e.target.value)
                          }
                          placeholder="e.g. Main Hallway"
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Antecedent (What happened right before?)</Label>
                      <Textarea
                        rows={2}
                        value={formData.incAntecedent}
                        onChange={(e) =>
                          handleInputChange("incAntecedent", e.target.value)
                        }
                        placeholder="What triggered or preceded the event?"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Behavior / Event Details (What exactly happened?)
                      </Label>
                      <Textarea
                        rows={3}
                        value={formData.incBehavior}
                        onChange={(e) =>
                          handleInputChange("incBehavior", e.target.value)
                        }
                        placeholder="Describe the incident objectively."
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Intervention / Support Provided</Label>
                      <Textarea
                        rows={2}
                        value={formData.incIntervention}
                        onChange={(e) =>
                          handleInputChange("incIntervention", e.target.value)
                        }
                        placeholder="How did staff respond or support?"
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Outcome / Status</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Resolved - No further action",
                            "Escalated to Manager",
                            "Medical Attention Required",
                            "Family/Guardian Notified",
                            "Ongoing Monitoring",
                          ].map((out) => (
                            <button
                              key={out}
                              onClick={() =>
                                handleInputChange("incOutcome", out)
                              }
                              className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.incOutcome === out ? "bg-red-200 border-red-300 text-red-900" : "bg-white hover:border-red-400 text-slate-700"}`}
                            >
                              {out}
                            </button>
                          ))}
                        </div>
                        <Input
                          value={formData.incOutcome}
                          onChange={(e) =>
                            handleInputChange("incOutcome", e.target.value)
                          }
                          placeholder="e.g. Escalation resolved, client calm."
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === "general" && (
                  <div className="grid grid-cols-1 gap-6 bg-slate-50 dark:bg-slate-900/20 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-2">
                      <Label>Context / Event</Label>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {[
                            "General Update",
                            "Medical/Health Update",
                            "Schedule Change",
                            "Positive Milestone",
                            "Financial/Billing",
                          ].map((ctx) => (
                            <button
                              key={ctx}
                              onClick={() =>
                                handleInputChange("genContext", ctx)
                              }
                              className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.genContext === ctx ? "bg-slate-200 border-slate-300 text-slate-900 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600" : "bg-white dark:bg-slate-950 hover:border-slate-400 text-slate-700 dark:text-slate-300"}`}
                            >
                              {ctx}
                            </button>
                          ))}
                        </div>
                        <Input
                          value={formData.genContext}
                          onChange={(e) =>
                            handleInputChange("genContext", e.target.value)
                          }
                          placeholder="Initial context or reason for note"
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Details / Observations</Label>
                      <Textarea
                        rows={4}
                        value={formData.genDetails}
                        onChange={(e) =>
                          handleInputChange("genDetails", e.target.value)
                        }
                        placeholder="Enter full details here..."
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Next Steps / Actions</Label>
                      <Input
                        value={formData.genAction}
                        onChange={(e) =>
                          handleInputChange("genAction", e.target.value)
                        }
                        placeholder="e.g. Schedule follow-up meeting"
                        className="bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Barriers specific to Activity Notes */}
              {category === "activity" && (
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />{" "}
                    Barriers to Participation
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Physical Barriers</Label>
                      <Input
                        value={barriers.physical}
                        onChange={(e) =>
                          setBarriers((prev) => ({
                            ...prev,
                            physical: e.target.value,
                          }))
                        }
                        placeholder="e.g. wheelchair access limited"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sensory / Environmental</Label>
                      <Input
                        value={barriers.sensory}
                        onChange={(e) =>
                          setBarriers((prev) => ({
                            ...prev,
                            sensory: e.target.value,
                          }))
                        }
                        placeholder="e.g. noise levels too high"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cognitive / Emotional</Label>
                      <Input
                        value={barriers.cognitive}
                        onChange={(e) =>
                          setBarriers((prev) => ({
                            ...prev,
                            cognitive: e.target.value,
                          }))
                        }
                        placeholder="e.g. anxious about new activity"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Social / Motivational</Label>
                      <Input
                        value={barriers.social}
                        onChange={(e) =>
                          setBarriers((prev) => ({
                            ...prev,
                            social: e.target.value,
                          }))
                        }
                        placeholder="e.g. peer conflict before start"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label className="text-xs">
                      Strategies used to overcome barriers
                    </Label>
                    <Textarea
                      rows={2}
                      value={barriers.strategies}
                      onChange={(e) =>
                        setBarriers((prev) => ({
                          ...prev,
                          strategies: e.target.value,
                        }))
                      }
                      placeholder="e.g. Moved to quiet room for 15 mins to regulate before returning to group."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Impact on Participation</Label>
                    <select
                      value={barriers.impact}
                      onChange={(e) =>
                        setBarriers((prev) => ({
                          ...prev,
                          impact: e.target.value as any,
                        }))
                      }
                      className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md p-2 h-10"
                    >
                      <option value="">-- Select --</option>
                      <option value="Low">
                        Low - Monitored but participated fully
                      </option>
                      <option value="Medium">
                        Medium - Required extra support/adaptations
                      </option>
                      <option value="High">
                        High - Unable to participate fully
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Staging Area */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-4 space-y-4">
            {/* The Staging Area controls the Final Output */}
            <Card className="shadow-lg border-indigo-200 overflow-hidden flex flex-col transition-all">
              <CardHeader className="bg-indigo-600 dark:bg-indigo-800 text-white p-4 shrink-0 shadow-sm relative z-10">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>Staging Area & Final Note</span>
                  {!isManuallyEdited && finalContent.length > 5 && (
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest font-black">
                      Auto Content
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-indigo-100 text-xs mt-1">
                  Clean up, edit, and finalize your text below before saving.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50 relative flex flex-col">
                <Textarea
                  value={finalContent}
                  onChange={(e) => {
                    setFinalContent(e.target.value);
                    setIsManuallyEdited(true);
                  }}
                  placeholder="Select a note type and build your documentation, or start typing directly here..."
                  className="flex-1 min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-none font-medium text-slate-800 dark:text-slate-200 leading-relaxed p-5 bg-transparent"
                />

                {isManuallyEdited && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm border border-amber-200 dark:border-amber-800 fade-in animate-in">
                    <AlertTriangle className="w-3 h-3" /> Manually Edited
                    <button
                      onClick={() => {
                        setIsManuallyEdited(false);
                        setFinalContent(autoGeneratedText);
                      }}
                      className="underline hover:text-amber-900 ml-1 opacity-80"
                    >
                      Revert
                    </button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-white dark:bg-slate-950 p-4 shrink-0 flex flex-col gap-3">
                <Button
                  onClick={handleSave}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm h-12"
                  disabled={!finalContent || selectedClientIds.length === 0}
                >
                  <Save className="w-4 h-4" /> Save to Client File(s)
                </Button>

                <div className="flex gap-2 w-full">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1 gap-2 shadow-sm text-xs h-9"
                    disabled={!finalContent}
                  >
                    {copied ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copied ? "Copied" : "Copy Text"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextClient}
                    className="flex-1 gap-2 text-slate-600 dark:text-slate-400 text-xs h-9"
                  >
                    <RefreshCw className="w-3 h-3" /> Clear for Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Recent Notes */}
            <Card className="shadow-lg border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b p-4">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                  <History className="w-4 h-4" /> Your Recent Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col divide-y">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <h4
                          className="font-bold text-sm text-indigo-700 max-w-full truncate"
                          title={n.subject}
                        >
                          {n.subject}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {n.noteType}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(n.timestamp).toLocaleDateString()} •{" "}
                          {clients
                            .filter((c) => n.clientIds.includes(c.id))
                            .map((c) => c.name)
                            .join(", ")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No recent notes created by you.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

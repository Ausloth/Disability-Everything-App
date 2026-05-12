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
  PhoneCall,
  Pill,
  Coffee,
} from "lucide-react";

const NOTE_TYPES = [
  "Activity / Session Note",
  "Medication Administration",
  "Mealtime / Food Administration",
  "Family / Support Network Communication",
  "Internal Team Communication / Handover",
  "Document / Administration Update",
  "Financial Query or Transaction Note",
  "Appointment / External Provider Attendance",
  "Incident / Behaviour Note",
  "Goal Review / Progress Note",
  "Other",
];

interface JournalFormData {
  name: string;
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
  medNames: string;
  medDoseTime: string;
  medRoute: string;
  medAdministeredBy: string;
  medMissed: boolean;
  medMissReason: string;
  medSideEffects: string;
  medPrn: string;
  medNotes: string;
  mealType: string;
  mealOffered: string;
  mealConsumed: string;
  mealAssistance: string;
  mealChoking: string;
  mealRefusal: string;
  mealFluid: string;
  mealNotes: string;
  commMethod: string;
  commContactType: string;
  commContactName: string;
  commRegarding: string;
  commDiscussion: string;
  commOutcome: string;
  incId: string;
  incType: string;
  incLocation: string;
  incAntecedent: string;
  incBehavior: string;
  incIntervention: string;
  incOutcome: string;
  genContext: string;
  genDetails: string;
  genAction: string;
}

const INITIAL_FORM_DATA: JournalFormData = {
  name: "",
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
  medNames: "",
  medDoseTime: "",
  medRoute: "Oral",
  medAdministeredBy: "",
  medMissed: false,
  medMissReason: "",
  medSideEffects: "",
  medPrn: "",
  medNotes: "",
  mealType: "Lunch",
  mealOffered: "",
  mealConsumed: "100%",
  mealAssistance: "Independent",
  mealChoking: "",
  mealRefusal: "",
  mealFluid: "",
  mealNotes: "",
  commMethod: "Called",
  commContactType: "Family Member",
  commContactName: "",
  commRegarding: "",
  commDiscussion: "",
  commOutcome: "",
  incId: "",
  incType: "Behavioral",
  incLocation: "",
  incAntecedent: "",
  incBehavior: "",
  incIntervention: "",
  incOutcome: "",
  genContext: "",
  genDetails: "",
  genAction: "",
};

const ensurePeriod = (s: string) =>
  s && !/[.!?]$/.test(s.trim()) ? `${s.trim()}.` : s?.trim() || "";

const getCategory = (t: string) => {
  if (t === "Activity / Session Note") return "activity";
  if (t === "Medication Administration") return "medication";
  if (t === "Mealtime / Food Administration") return "mealtime";
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
    let p = [];
    let lead =
      data.timeType === "Morning"
        ? "During the morning session, "
        : data.timeType === "Afternoon"
          ? "During the afternoon session, "
          : data.timeType === "All Day"
            ? "Throughout the day, "
            : "Today, ";
    lead += `${clientName} participated in ${data.activity ? data.activity.toLowerCase() : "scheduled activities"}`;
    if (data.location)
      lead +=
        data.location === "Community"
          ? " in the community"
          : ` (${data.location})`;
    p.push(ensurePeriod(lead));
    if (data.environment)
      p.push(
        `The session took place in a ${data.environment.toLowerCase()} environment.`,
      );
    if (data.ratio)
      p.push(
        data.ratio.includes(":")
          ? `${clientName} was supported at a ${data.ratio} ratio.`
          : `${clientName} received ${data.ratio.toLowerCase()} support.`,
      );
    if (data.specificActivity)
      p.push(
        ensurePeriod(
          /^(he |she |they )/i.test(data.specificActivity.trim()) ||
            data.specificActivity
              .toLowerCase()
              .startsWith(clientName.toLowerCase())
            ? data.specificActivity
            : `${clientName} ${data.specificActivity}`,
        ),
      );
    if (data.mood)
      p.push(
        data.mood === "Calm"
          ? `${clientName} appeared calm and content throughout.`
          : data.mood === "Positive"
            ? `${clientName} appeared happy and enthusiastic.`
            : data.mood === "Anxious"
              ? "Signs of anxiety or nervousness were observed."
              : data.mood === "Fatigued"
                ? `${clientName} appeared fatigued with low energy levels.`
                : data.mood === "Focused"
                  ? "Focus and engagement levels were high."
                  : `Mood was observed as ${data.mood.toLowerCase()}.`,
      );
    if (data.minorBehavior)
      p.push(
        data.minorBehavior === "Cooperative"
          ? "Behavior was cooperative and direction was followed well."
          : data.minorBehavior === "Distracted"
            ? `${clientName} was easily distracted and required occasional prompts.`
            : data.minorBehavior === "Minor agitation"
              ? "Episodes of mild agitation were noted but managed with standard support."
              : data.minorBehavior === "Refusal"
                ? "There were instances of task refusal during the session."
                : `Behavior: ${data.minorBehavior}`,
      );
    if (data.goal)
      p.push(
        ensurePeriod(
          `The primary timeframe goal was related to ${data.goal.toLowerCase()}`,
        ),
      );
    if (data.goalProgression)
      p.push(
        ensurePeriod(
          /^(he |she |they )/i.test(data.goalProgression) ||
            data.goalProgression
              .toLowerCase()
              .startsWith(clientName.toLowerCase())
            ? data.goalProgression
            : `Regarding this goal, ${clientName} ${data.goalProgression.toLowerCase()}`,
        ),
      );
    if (data.activityReflection) p.push(ensurePeriod(data.activityReflection));
    return p.join(" ");
  }

  if (category === "medication") {
    let p = [`Medication Administration Record: ${clientName}`];
    if (data.medMissed) {
      p.push(`STATUS: MISSED / NOT ADMINISTERED`);
      if (data.medMissReason) p.push(`Reason for miss: ${data.medMissReason}`);
    } else {
      p.push(`STATUS: ADMINISTERED`);
      if (data.medNames) p.push(`Medication(s): ${data.medNames}`);
      if (data.medDoseTime) p.push(`Dose & Time: ${data.medDoseTime}`);
      if (data.medRoute) p.push(`Route: ${data.medRoute}`);
      if (data.medAdministeredBy)
        p.push(`Administered By: ${data.medAdministeredBy}`);
    }
    if (data.medSideEffects)
      p.push(`\nObserved Side Effects / Reactions:\n${data.medSideEffects}`);
    if (data.medPrn) p.push(`\nPRN Usage / Context:\n${data.medPrn}`);
    if (data.medNotes) p.push(`\nAdditional Notes:\n${data.medNotes}`);
    return p.join("\n");
  }

  if (category === "mealtime") {
    let p = [`Mealtime / Food Administration: ${clientName}`];
    if (data.mealType) p.push(`Meal/Time: ${data.mealType}`);
    if (data.mealOffered)
      p.push(`\nFoods/Fluids Offered:\n${data.mealOffered}`);
    if (data.mealConsumed) p.push(`Amount Consumed: ${data.mealConsumed}`);
    if (data.mealFluid) p.push(`Fluid Intake: ${data.mealFluid}`);
    if (data.mealAssistance)
      p.push(`Assistance Required: ${data.mealAssistance}`);
    if (data.mealChoking)
      p.push(`\nChoking/Swallowing Issues Noted:\n${data.mealChoking}`);
    if (data.mealRefusal)
      p.push(`\nRefusal or Behavioral Notes during meal:\n${data.mealRefusal}`);
    if (data.mealNotes)
      p.push(
        `\nAdditional Notes (Special diets, supplements, etc.):\n${data.mealNotes}`,
      );
    return p.join("\n");
  }

  if (category === "comm") {
    let p = [];
    let method = data.commMethod || "Contacted";
    let type = data.commContactType || "the relevant party";
    let nm = data.commContactName ? ` (${data.commContactName})` : "";
    let lead = `${method} ${type.toLowerCase()}${nm} regarding ${clientName}`;
    if (data.commRegarding) lead += ` to discuss ${data.commRegarding}.`;
    else lead += ".";
    p.push(ensurePeriod(lead));
    if (data.commDiscussion)
      p.push(`Discussion Details:\n${data.commDiscussion}`);
    if (data.commOutcome) p.push(`Outcome / Next Steps:\n${data.commOutcome}`);
    return p.join("\n\n");
  }

  if (category === "incident") {
    let p = [];
    let baseTitle = `Incident Report: ${data.incType || "General"} Incident involving ${clientName}`;
    p.push(data.incId ? `${baseTitle} (Ref: ${data.incId})` : baseTitle);
    if (data.incLocation) p.push(`Location: ${data.incLocation}`);
    if (data.incAntecedent)
      p.push(`A - Antecedent (Before):\n${data.incAntecedent}`);
    if (data.incBehavior)
      p.push(`B - Behavior / Event Details:\n${data.incBehavior}`);
    if (data.incIntervention)
      p.push(
        `C - Consequence / Intervention (Actions Taken):\n${data.incIntervention}`,
      );
    if (data.incOutcome)
      p.push(`Outcome / Current Status:\n${data.incOutcome}`);
    return p.join("\n\n");
  }

  let p = [];
  if (data.genContext) p.push(`Context / Event:\n${data.genContext}`);
  if (data.genDetails) p.push(`Details / Observations:\n${data.genDetails}`);
  if (data.genAction) p.push(`Next Steps / Actions:\n${data.genAction}`);
  return p.join("\n\n");
};

const InputGroup = ({
  label,
  children,
  colSpan = 1,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: number;
}) => (
  <div className={`space-y-2 ${colSpan ? `md:col-span-${colSpan}` : ""}`}>
    <Label>{label}</Label>
    {children}
  </div>
);

const ChipGroup = ({
  options,
  value,
  onChange,
  activeClass,
  hoverClass,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  activeClass: string;
  hoverClass: string;
}) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onChange(o)}
        className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors ${value === o ? activeClass : hoverClass}`}
      >
        {o}
      </button>
    ))}
  </div>
);

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
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [time, setTime] = useState<string>(
    new Date().toTimeString().substring(0, 5),
  );
  const [noteType, setNoteType] = useState<string>(NOTE_TYPES[0]);
  const [customType, setCustomType] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [formData, setFormData] = useState<JournalFormData>(INITIAL_FORM_DATA);
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [finalContent, setFinalContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);

  const [barriers, setBarriers] = useState({
    physical: "",
    sensory: "",
    cognitive: "",
    social: "",
    strategies: "",
    impact: "" as any,
  });

  const category = getCategory(noteType);
  const selectedClientNames = clients
    .filter((c) => selectedClientIds.includes(c.id))
    .map((c) => c.name);
  const autoGeneratedText = useMemo(
    () => generateJournalText(noteType, formData, selectedClientNames),
    [noteType, formData, selectedClientNames],
  );

  useEffect(() => {
    if (!isManuallyEdited) setFinalContent(autoGeneratedText);
  }, [autoGeneratedText, isManuallyEdited]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get("scheduleId");
    const clientId = params.get("client");
    const passedType = params.get("type");

    if (sid) {
      setSelectedScheduleId(sid);
      setNoteType("Activity / Session Note");
      const selSched = schedules.find((s) => s.id === sid);
      if (selSched)
        setSelectedClientIds(
          clients
            .filter((c) => selSched.clients.includes(c.name))
            .map((c) => c.id),
        );
    } else if (clientId) {
      setSelectedClientIds([clientId]);
      if (passedType === "medication") {
        setNoteType("Medication Administration");
      } else if (passedType === "meal") {
        setNoteType("Mealtime / Food Administration");
      } else if (passedType === "communication") {
        setNoteType("Family / Support Network Communication");
      } else if (passedType === "goal") {
        setNoteType("Goal Review / Progress Note");
      } else if (passedType === "incident") {
        setNoteType("Incident / Behaviour Note");
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

  const handleChange = (field: keyof JournalFormData, value: any) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleCopy = () => {
    navigator.clipboard.writeText(finalContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextClient = () => {
    setFormData((p) => ({
      ...INITIAL_FORM_DATA,
      activity: p.activity,
      location: p.location,
      timeType: p.timeType,
      environment: p.environment,
      ratio: p.ratio,
      goal: p.goal,
      genContext: p.genContext,
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

  const availableGoals = clients
    .filter((c) => selectedClientIds.includes(c.id))
    .flatMap((c) => (c.goals || []).map((g) => ({ ...g, clientName: c.name })));

  const toggleClient = (id: string) => {
    setSelectedClientIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );
    setSelectedGoalIds([]);
    const clientObj = clients.find((c) => c.id === id);
    if (clientObj && !formData.name && selectedClientIds.length === 0)
      handleChange("name", clientObj.name);
  };

  const toggleGoal = (id: string) =>
    setSelectedGoalIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

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
    if (category === "medication") {
      newNote.medicationData = {
        medNames: formData.medNames,
        medDoseTime: formData.medDoseTime,
        medRoute: formData.medRoute,
        medAdministeredBy: formData.medAdministeredBy,
        medMissed: formData.medMissed,
        medMissReason: formData.medMissReason,
        medSideEffects: formData.medSideEffects,
        medPrn: formData.medPrn,
      };
    }
    if (category === "mealtime") {
      newNote.mealtimeData = {
        mealType: formData.mealType,
        mealOffered: formData.mealOffered,
        mealConsumed: formData.mealConsumed,
        mealAssistance: formData.mealAssistance,
        mealChoking: formData.mealChoking,
        mealRefusal: formData.mealRefusal,
        mealFluid: formData.mealFluid,
        mealNotes: formData.mealNotes,
      };
    }
    addJournalNote(newNote);
    alert("Note saved successfully!");
    setSubject("");
    setFinalContent("");
    setIsManuallyEdited(false);
    setFormData((p) => ({
      ...INITIAL_FORM_DATA,
      activity: p.activity,
      location: p.location,
      timeType: p.timeType,
      environment: p.environment,
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
          Log progress, incidents, communication, medication, and session notes
          directly to client files.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/30">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30 pb-4">
              <CardTitle className="text-lg">New Note Entry</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* COMMON FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Note Type">
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
                </InputGroup>
                {noteType === "Other" && (
                  <InputGroup label="Custom Note Type">
                    <Input
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="e.g. Transport Log"
                      className="h-10"
                    />
                  </InputGroup>
                )}
                <InputGroup label="Date">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10"
                  />
                </InputGroup>
                <InputGroup label="Time">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10"
                  />
                </InputGroup>
                <InputGroup label="Subject / Title (Optional)" colSpan={2}>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="font-medium h-10"
                  />
                </InputGroup>
              </div>

              {/* LINKED CLIENTS & GOALS */}
              <div className="space-y-4">
                <InputGroup label="Linked Clients (Required)">
                  <div className="flex flex-wrap gap-2">
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => toggleClient(client.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${selectedClientIds.includes(client.id) ? "bg-indigo-100 border-indigo-300 text-indigo-800" : "bg-white dark:bg-slate-950 hover:border-indigo-400"}`}
                      >
                        <User className="w-3 h-3 opacity-70" /> {client.name}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                {availableGoals.length > 0 && (
                  <div className="space-y-2 bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-100">
                    <Label className="text-emerald-800 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Link Evidence to Client Goals
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableGoals.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`text-[11px] px-2.5 py-1 rounded border shadow-sm transition-colors flex items-start gap-1.5 max-w-[300px] ${selectedGoalIds.includes(goal.id) ? "bg-emerald-200 border-emerald-400 text-emerald-900" : "bg-white border-emerald-200"}`}
                        >
                          <span className="truncate">
                            {goal.clientName}: {goal.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DYNAMIC SECTIONS */}
              <div className="space-y-6 pt-2">
                <div className="pb-2">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" /> Structure
                    Builder
                  </h3>
                </div>

                {category === "activity" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/20 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <InputGroup label="Primary Subject / Name">
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g. John"
                      />
                    </InputGroup>
                    <InputGroup label="Activity / Focus">
                      <Input
                        value={formData.activity}
                        onChange={(e) =>
                          handleChange("activity", e.target.value)
                        }
                        placeholder="e.g. Bowling"
                      />
                    </InputGroup>
                    <InputGroup label="Location Setting">
                      <ChipGroup
                        options={[
                          "Onsite",
                          "Community",
                          "In-Home",
                          "Transport",
                        ]}
                        value={formData.location}
                        onChange={(v) => handleChange("location", v)}
                        activeClass="bg-indigo-100 border-indigo-300 text-indigo-900"
                        hoverClass="bg-white hover:border-indigo-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup label="Session Time">
                      <ChipGroup
                        options={["Morning", "Afternoon", "All Day", "Evening"]}
                        value={formData.timeType}
                        onChange={(v) => handleChange("timeType", v)}
                        activeClass="bg-indigo-100 border-indigo-300 text-indigo-900"
                        hoverClass="bg-white hover:border-indigo-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup
                      label="Specific Participation / Actions"
                      colSpan={2}
                    >
                      <Textarea
                        rows={2}
                        value={formData.specificActivity}
                        onChange={(e) =>
                          handleChange("specificActivity", e.target.value)
                        }
                        placeholder="e.g. engaged strongly with the art project."
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Overall Mood" colSpan={2}>
                      <ChipGroup
                        options={[
                          "Calm",
                          "Positive",
                          "Anxious",
                          "Fatigued",
                          "Focused",
                          "Regulated",
                          "Dysregulated",
                        ]}
                        value={formData.mood}
                        onChange={(v) => handleChange("mood", v)}
                        activeClass="bg-indigo-100 border-indigo-300 text-indigo-900"
                        hoverClass="bg-white hover:border-indigo-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup label="Behavior / Engagement" colSpan={2}>
                      <ChipGroup
                        options={[
                          "Cooperative",
                          "Distracted",
                          "Minor agitation",
                          "Refusal",
                          "Highly Engaged",
                          "Withdrawn",
                        ]}
                        value={formData.minorBehavior}
                        onChange={(v) => handleChange("minorBehavior", v)}
                        activeClass="bg-indigo-100 border-indigo-300 text-indigo-900"
                        hoverClass="bg-white hover:border-indigo-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup label="Progress Toward Goals" colSpan={2}>
                      <Textarea
                        rows={2}
                        value={formData.goalProgression}
                        onChange={(e) =>
                          handleChange("goalProgression", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup
                      label="Closing Reflection / Next Steps"
                      colSpan={2}
                    >
                      <Input
                        value={formData.activityReflection}
                        onChange={(e) =>
                          handleChange("activityReflection", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>

                    {/* Barriers Sub-section */}
                    <div className="md:col-span-2 space-y-4 mt-4 pt-6 border-t border-slate-200">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />{" "}
                        Barriers to Participation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputGroup label="Physical">
                          <Input
                            value={barriers.physical}
                            onChange={(e) =>
                              setBarriers((p) => ({
                                ...p,
                                physical: e.target.value,
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </InputGroup>
                        <InputGroup label="Sensory / Env">
                          <Input
                            value={barriers.sensory}
                            onChange={(e) =>
                              setBarriers((p) => ({
                                ...p,
                                sensory: e.target.value,
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </InputGroup>
                        <InputGroup label="Cognitive / Emo">
                          <Input
                            value={barriers.cognitive}
                            onChange={(e) =>
                              setBarriers((p) => ({
                                ...p,
                                cognitive: e.target.value,
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </InputGroup>
                        <InputGroup label="Social">
                          <Input
                            value={barriers.social}
                            onChange={(e) =>
                              setBarriers((p) => ({
                                ...p,
                                social: e.target.value,
                              }))
                            }
                            className="h-8 text-sm"
                          />
                        </InputGroup>
                      </div>
                      <InputGroup label="Strategies used to overcome barriers">
                        <Textarea
                          rows={2}
                          value={barriers.strategies}
                          onChange={(e) =>
                            setBarriers((p) => ({
                              ...p,
                              strategies: e.target.value,
                            }))
                          }
                        />
                      </InputGroup>
                    </div>
                  </div>
                )}

                {category === "medication" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-rose-50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                    <div className="md:col-span-2 flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-200">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">
                          Missed Medication?
                        </Label>
                        <p className="text-xs text-slate-500">
                          Enable this if the medication was refused or missed.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.medMissed}
                        onChange={(e) =>
                          handleChange("medMissed", e.target.checked)
                        }
                        className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                    </div>

                    {formData.medMissed ? (
                      <InputGroup
                        label="Reason for Missed Medication"
                        colSpan={2}
                      >
                        <Textarea
                          rows={3}
                          value={formData.medMissReason}
                          onChange={(e) =>
                            handleChange("medMissReason", e.target.value)
                          }
                          placeholder="Provide full details of refusal or error..."
                          className="bg-white border-rose-200 focus-visible:ring-rose-500"
                        />
                      </InputGroup>
                    ) : (
                      <>
                        <InputGroup label="Medication Name(s)">
                          <Input
                            value={formData.medNames}
                            onChange={(e) =>
                              handleChange("medNames", e.target.value)
                            }
                            placeholder="e.g. Risperidone"
                            className="bg-white"
                          />
                        </InputGroup>
                        <InputGroup label="Dose & Time Administered">
                          <Input
                            value={formData.medDoseTime}
                            onChange={(e) =>
                              handleChange("medDoseTime", e.target.value)
                            }
                            placeholder="e.g. 1mg at 08:00 AM"
                            className="bg-white"
                          />
                        </InputGroup>
                        <InputGroup label="Route / Method">
                          <ChipGroup
                            options={[
                              "Oral",
                              "Topical",
                              "Injection",
                              "Drop",
                              "Inhaler",
                              "Other",
                            ]}
                            value={formData.medRoute}
                            onChange={(v) => handleChange("medRoute", v)}
                            activeClass="bg-rose-200 border-rose-300 text-rose-900"
                            hoverClass="bg-white hover:border-rose-400 text-slate-700"
                          />
                        </InputGroup>
                        <InputGroup label="Administered By">
                          <Input
                            value={formData.medAdministeredBy}
                            onChange={(e) =>
                              handleChange("medAdministeredBy", e.target.value)
                            }
                            placeholder="e.g. Staff Name / Self"
                            className="bg-white"
                          />
                        </InputGroup>
                      </>
                    )}

                    <InputGroup
                      label="Observed Side Effects / Reaction"
                      colSpan={2}
                    >
                      <Textarea
                        rows={2}
                        value={formData.medSideEffects}
                        onChange={(e) =>
                          handleChange("medSideEffects", e.target.value)
                        }
                        placeholder="Any issues after administration?"
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="PRN Usage (If applicable)" colSpan={2}>
                      <Textarea
                        rows={2}
                        value={formData.medPrn}
                        onChange={(e) => handleChange("medPrn", e.target.value)}
                        placeholder="Context for PRN administration..."
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Additional Notes" colSpan={2}>
                      <Textarea
                        rows={2}
                        value={formData.medNotes}
                        onChange={(e) =>
                          handleChange("medNotes", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                  </div>
                )}

                {category === "mealtime" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-100 dark:border-orange-900/30">
                    <InputGroup label="Meal Type / Time">
                      <ChipGroup
                        options={[
                          "Breakfast",
                          "Morning Tea",
                          "Lunch",
                          "Afternoon Tea",
                          "Dinner",
                          "Snack",
                        ]}
                        value={formData.mealType}
                        onChange={(v) => handleChange("mealType", v)}
                        activeClass="bg-orange-200 border-orange-300 text-orange-900"
                        hoverClass="bg-white hover:border-orange-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup label="Foods / Fluids Offered" colSpan={2}>
                      <Textarea
                        rows={2}
                        value={formData.mealOffered}
                        onChange={(e) =>
                          handleChange("mealOffered", e.target.value)
                        }
                        placeholder="What was provided to the client?"
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Amount Consumed">
                      <ChipGroup
                        options={[
                          "None (0%)",
                          "Minimal",
                          "Half (50%)",
                          "Most (75%)",
                          "All (100%)",
                        ]}
                        value={formData.mealConsumed}
                        onChange={(v) => handleChange("mealConsumed", v)}
                        activeClass="bg-orange-200 border-orange-300 text-orange-900"
                        hoverClass="bg-white hover:border-orange-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup label="Assistance Required">
                      <ChipGroup
                        options={[
                          "Independent",
                          "Setup Only",
                          "Prompting",
                          "Full Assistance",
                          "Enteral/PEG",
                        ]}
                        value={formData.mealAssistance}
                        onChange={(v) => handleChange("mealAssistance", v)}
                        activeClass="bg-orange-200 border-orange-300 text-orange-900"
                        hoverClass="bg-white hover:border-orange-400 text-slate-700"
                      />
                    </InputGroup>
                    <InputGroup
                      label="Any Choking / Swallowing Issues Noting?"
                      colSpan={2}
                    >
                      <Textarea
                        rows={2}
                        value={formData.mealChoking}
                        onChange={(e) =>
                          handleChange("mealChoking", e.target.value)
                        }
                        placeholder="Coughing, spluttering, clearing throat..."
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup
                      label="Refusal / Behaviors during meal"
                      colSpan={2}
                    >
                      <Textarea
                        rows={2}
                        value={formData.mealRefusal}
                        onChange={(e) =>
                          handleChange("mealRefusal", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Total Fluid Intake (approx)">
                      <Input
                        value={formData.mealFluid}
                        onChange={(e) =>
                          handleChange("mealFluid", e.target.value)
                        }
                        placeholder="e.g. 500ml water"
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Additional Notes">
                      <Input
                        value={formData.mealNotes}
                        onChange={(e) =>
                          handleChange("mealNotes", e.target.value)
                        }
                        placeholder="Special diets, supplements, etc."
                        className="bg-white"
                      />
                    </InputGroup>
                  </div>
                )}

                {category === "comm" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <InputGroup label="Contact Method">
                      <ChipGroup
                        options={["Called", "Emailed", "Messaged", "Met with"]}
                        value={formData.commMethod}
                        onChange={(v) => handleChange("commMethod", v)}
                        activeClass="bg-blue-200 border-blue-300 text-blue-900"
                        hoverClass="bg-white hover:border-blue-400"
                      />
                    </InputGroup>
                    <InputGroup label="Contact Type">
                      <ChipGroup
                        options={[
                          "Family Member",
                          "Support Coordinator",
                          "Therapist",
                          "Medical Professional",
                          "Teacher / School",
                          "Internal Team Member",
                        ]}
                        value={formData.commContactType}
                        onChange={(v) => handleChange("commContactType", v)}
                        activeClass="bg-blue-200 border-blue-300 text-blue-900"
                        hoverClass="bg-white hover:border-blue-400"
                      />
                    </InputGroup>
                    <InputGroup label="Contact Name">
                      <Input
                        value={formData.commContactName}
                        onChange={(e) =>
                          handleChange("commContactName", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Regarding">
                      <Input
                        value={formData.commRegarding}
                        onChange={(e) =>
                          handleChange("commRegarding", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Discussion Details" colSpan={2}>
                      <Textarea
                        rows={3}
                        value={formData.commDiscussion}
                        onChange={(e) =>
                          handleChange("commDiscussion", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Outcome / Next Steps" colSpan={2}>
                      <Textarea
                        rows={2}
                        value={formData.commOutcome}
                        onChange={(e) =>
                          handleChange("commOutcome", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                  </div>
                )}

                {category === "incident" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50 p-5 rounded-xl border border-red-100">
                    <InputGroup label="Incident Type" colSpan={2}>
                      <ChipGroup
                        options={[
                          "Behavioral",
                          "Medical",
                          "Medication Error",
                          "Medication Refusal",
                          "Environmental",
                          "Staff/Workplace",
                          "Near Miss",
                          "Other",
                        ]}
                        value={formData.incType}
                        onChange={(v) => handleChange("incType", v)}
                        activeClass="bg-red-200 border-red-300 text-red-900"
                        hoverClass="bg-white hover:border-red-400"
                      />
                    </InputGroup>
                    <InputGroup label="Incident ID / Ref (External)">
                      <Input
                        value={formData.incId}
                        onChange={(e) => handleChange("incId", e.target.value)}
                        placeholder="e.g. INC-2023-001"
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Location / Setting">
                      <div className="space-y-2">
                        <ChipGroup
                          options={[
                            "Centre / Onsite",
                            "Community",
                            "Vehicle",
                            "Client Home",
                          ]}
                          value={formData.incLocation}
                          onChange={(v) => handleChange("incLocation", v)}
                          activeClass="bg-red-200 border-red-300 text-red-900"
                          hoverClass="bg-white hover:border-red-400"
                        />
                        <Input
                          value={formData.incLocation}
                          onChange={(e) =>
                            handleChange("incLocation", e.target.value)
                          }
                          placeholder="Location detail..."
                          className="bg-white"
                        />
                      </div>
                    </InputGroup>
                    <InputGroup label="A - Antecedent (Before)" colSpan={2}>
                      <Textarea
                        rows={2}
                        value={formData.incAntecedent}
                        onChange={(e) =>
                          handleChange("incAntecedent", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup
                      label="B - Behavior / Event Details"
                      colSpan={2}
                    >
                      <Textarea
                        rows={3}
                        value={formData.incBehavior}
                        onChange={(e) =>
                          handleChange("incBehavior", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup
                      label="C - Consequence / Intervention"
                      colSpan={2}
                    >
                      <Textarea
                        rows={2}
                        value={formData.incIntervention}
                        onChange={(e) =>
                          handleChange("incIntervention", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Outcome / Status" colSpan={2}>
                      <div className="space-y-2">
                        <ChipGroup
                          options={[
                            "Resolved",
                            "Escalated",
                            "Medical Attention",
                            "Family Notified",
                            "Ongoing",
                          ]}
                          value={formData.incOutcome}
                          onChange={(v) => handleChange("incOutcome", v)}
                          activeClass="bg-red-200 border-red-300 text-red-900"
                          hoverClass="bg-white hover:border-red-400"
                        />
                        <Input
                          value={formData.incOutcome}
                          onChange={(e) =>
                            handleChange("incOutcome", e.target.value)
                          }
                          placeholder="Current status..."
                          className="bg-white"
                        />
                      </div>
                    </InputGroup>
                  </div>
                )}

                {category === "general" && (
                  <div className="grid grid-cols-1 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <InputGroup label="Context / Event">
                      <div className="space-y-2">
                        <ChipGroup
                          options={[
                            "General Update",
                            "Medical/Health Update",
                            "Schedule Change",
                            "Positive Milestone",
                            "Financial/Billing",
                          ]}
                          value={formData.genContext}
                          onChange={(v) => handleChange("genContext", v)}
                          activeClass="bg-slate-200 border-slate-300 text-slate-900"
                          hoverClass="bg-white hover:border-slate-400"
                        />
                        <Input
                          value={formData.genContext}
                          onChange={(e) =>
                            handleChange("genContext", e.target.value)
                          }
                          className="bg-white"
                        />
                      </div>
                    </InputGroup>
                    <InputGroup label="Details / Observations">
                      <Textarea
                        rows={4}
                        value={formData.genDetails}
                        onChange={(e) =>
                          handleChange("genDetails", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                    <InputGroup label="Next Steps / Actions">
                      <Input
                        value={formData.genAction}
                        onChange={(e) =>
                          handleChange("genAction", e.target.value)
                        }
                        className="bg-white"
                      />
                    </InputGroup>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STAGING AREA */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-4 space-y-4">
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
                  placeholder="Select a note type and build your documentation..."
                  className="flex-1 min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-none font-medium text-slate-800 dark:text-slate-200 leading-relaxed p-5 bg-transparent"
                />
                {isManuallyEdited && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">
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
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12"
                  disabled={!finalContent || selectedClientIds.length === 0}
                >
                  <Save className="w-4 h-4" /> Save to Client File(s)
                </Button>
                <div className="flex gap-2 w-full">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1 gap-2 text-xs h-9"
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
                    onClick={handleNextClient}
                    variant="outline"
                    className="flex-1 gap-2 text-slate-600 text-xs h-9"
                  >
                    <RefreshCw className="w-3 h-3" /> Clear for Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* RECENT NOTES */}
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
                        <h4 className="font-bold text-sm text-indigo-700 max-w-full truncate">
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
                      No recent notes.
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

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Copy,
  Check,
  Info,
  Sparkles,
  User,
  Tag,
  Activity,
  RefreshCw
} from "lucide-react";

interface JournalFormData {
  name: string
  activity: string
  location: string
  timeType: string
  environment: string
  ratio: string
  specificActivity: string
  mood: string
  minorBehavior: string
  goal: string
  goalProgression: string
  activityReflection: string
}

const INITIAL_FORM_DATA: JournalFormData = {
  name: '',
  activity: '',
  location: '',
  timeType: 'Day',
  environment: '',
  ratio: '',
  specificActivity: '',
  mood: '',
  minorBehavior: '',
  goal: '',
  goalProgression: '',
  activityReflection: ''
}

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const ensurePeriod = (s: string) => {
  if (!s) return ''
  const trimmed = s.trim()
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

const generateJournalText = (data: JournalFormData): string => {
  const {
    name, activity, location, timeType, environment,
    goal, goalProgression, ratio, specificActivity,
    mood, minorBehavior, activityReflection
  } = data

  if (!name) return ""

  const journalParts: string[] = []
  const clientName = capitalize(name)

  // --- SECTION 1: CONTEXT ---
  let contextSentence = ""
  if (timeType === 'Morning') contextSentence += "During the morning session, "
  else if (timeType === 'Afternoon') contextSentence += "During the afternoon session, "
  else if (timeType === 'All Day') contextSentence += "Throughout the day, "
  else contextSentence += "Today, "

  contextSentence += `${clientName} `
  
  const act = activity ? activity.toLowerCase() : "an activity"
  
  if (location === 'Community' || location === 'Offsite') {
     contextSentence += `accessed the community for ${act}`
  } else if (location === 'Onsite' || location === 'Centre') {
     contextSentence += `participated in ${act} at the centre`
  } else {
     contextSentence += `participated in ${act}`
     if (location) contextSentence += ` (${location})`
  }
  journalParts.push(ensurePeriod(contextSentence))

  // --- SECTION 2: ENVIRONMENT & SUPPORT ---
  if (environment) {
    journalParts.push(`The session took place in a ${environment.toLowerCase()} environment.`)
  }

  let supportSentence = ""
  if (ratio) {
    if (ratio.includes(':')) supportSentence += `${clientName} was supported at a ${ratio} ratio`
    else supportSentence += `${clientName} received ${ratio.toLowerCase()} support`
    journalParts.push(ensurePeriod(supportSentence))
  }

  // --- SECTION 3: NARRATIVE & MOOD ---
  if (specificActivity) {
    const trimmed = specificActivity.trim()
    const lower = trimmed.toLowerCase()
    if (lower.startsWith(name.toLowerCase()) || lower.startsWith('he ') || lower.startsWith('she ') || lower.startsWith('they ')) {
        journalParts.push(ensurePeriod(trimmed))
    } else {
        journalParts.push(ensurePeriod(`${clientName} ${lower}`))
    }
  }

  if (mood) {
    const m = mood
    if (m === 'Calm') journalParts.push(`${clientName} appeared calm and content throughout.`)
    else if (m === 'Positive') journalParts.push(`${clientName} appeared happy and enthusiastic.`)
    else if (m === 'Anxious') journalParts.push("Signs of anxiety or nervousness were observed.")
    else if (m === 'Fatigued') journalParts.push(`${clientName} appeared fatigued with low energy levels.`)
    else if (m === 'Focused') journalParts.push("Focus and engagement levels were high.")
    else journalParts.push(`Mood was observed as ${m.toLowerCase()}.`)
  }

  // --- SECTION 4: BEHAVIOR ---
  if (minorBehavior) {
    switch (minorBehavior) {
        case 'Cooperative': journalParts.push("Behavior was cooperative and direction was followed well."); break;
        case 'Distracted': journalParts.push(`${clientName} was easily distracted and required occasional prompts to stay on task.`); break;
        case 'Minor agitation': journalParts.push("Episodes of mild agitation were noted but managed with standard support."); break;
        case 'Refusal': journalParts.push("There were instances of task refusal during the session."); break;
    }
  }

  // --- SECTION 5: GOALS ---
  if (goal) {
     journalParts.push(ensurePeriod(`The primary timeframe goal was related to ${goal.toLowerCase()}`))
  }
  
  if (goalProgression) {
      const lower = goalProgression.toLowerCase()
      if (lower.startsWith(name.toLowerCase()) || lower.startsWith('he ') || lower.startsWith('she ')) {
          journalParts.push(ensurePeriod(goalProgression))
      } else {
          journalParts.push(ensurePeriod(`Regarding this goal, ${clientName} ${lower}`))
      }
  }

  // --- SECTION 6: REFLECTION ---
  if (activityReflection) {
     journalParts.push(ensurePeriod(activityReflection))
  }

  return journalParts.join(' ')
}

export function JournalTool() {
  const { schedules, activities, outlines } = useStore()
  const location = useLocation()
  
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('')
  const [formData, setFormData] = useState<JournalFormData>(INITIAL_FORM_DATA)
  const [previewText, setPreviewText] = useState('')
  const [copied, setCopied] = useState(false)

  // Try to pre-fill from query params if coming from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const sid = params.get('scheduleId')
    if (sid) {
      setSelectedScheduleId(sid)
    }
  }, [location])

  const selectedSchedule = schedules.find(s => s.id === selectedScheduleId)
  const activity = selectedSchedule ? activities.find(a => a.id === selectedSchedule.activityId) : null
  const outline = selectedSchedule ? outlines.find(o => o.id === selectedSchedule.outlineId) : null
  const week = outline && selectedSchedule ? outline.weeks.find(w => w.weekNumber === selectedSchedule.currentWeek) : null

  // Auto-generate preview on form data change
  useEffect(() => {
    setPreviewText(generateJournalText(formData))
  }, [formData])

  const handleInputChange = (field: keyof JournalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleNextClient = () => {
    setFormData(prev => ({
      ...INITIAL_FORM_DATA,
      activity: prev.activity,
      location: prev.location,
      timeType: prev.timeType,
      environment: prev.environment,
      ratio: prev.ratio,
      goal: prev.goal
    }))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900 dark:text-indigo-400">Journal Tool</h1>
        <p className="text-muted-foreground mt-2">Generate professional clinical notes quickly using contextual details from your day.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-indigo-100 dark:border-indigo-900/30">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-900/30 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Session Details
                </CardTitle>
                <select 
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-md text-sm px-3 py-1.5 min-w-[240px] shadow-sm"
                >
                  <option value="">-- Connect to a Session --</option>
                  {schedules.map(s => {
                    const act = activities.find(a => a.id === s.activityId)
                    return (
                      <option key={s.id} value={s.id}>{act?.name} ({s.time})</option>
                    )
                  })}
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              
              {/* Context Chips */}
              {selectedSchedule && activity && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Insert Context
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleInputChange('activity', activity.name)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-950 border shadow-sm hover:border-indigo-400 transition-colors flex items-center gap-1.5">
                      <Activity className="w-3 h-3 text-indigo-500" /> {activity.name}
                    </button>
                    <button onClick={() => handleInputChange('location', activity.category === 'Outdoors' ? 'Community' : 'Onsite')} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-950 border shadow-sm hover:border-indigo-400 transition-colors">
                      📍 {activity.location}
                    </button>
                    {week && (
                      <button onClick={() => handleInputChange('goal', week.goalProgression)} className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-950 border shadow-sm hover:border-indigo-400 transition-colors flex items-center gap-1.5 truncate max-w-[200px]">
                        <Tag className="w-3 h-3 text-emerald-500 shrink-0" /> {week.goalProgression}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 py-1.5">Clients:</span>
                    {selectedSchedule.clients.map((client, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleInputChange('name', client)}
                        className={`text-xs px-3 py-1.5 rounded-full border shadow-sm transition-colors flex items-center gap-1.5 ${formData.name === client ? 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300' : 'bg-white dark:bg-slate-950 hover:border-indigo-400'}`}
                      >
                        <User className="w-3 h-3 opacity-70" /> {client}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="e.g. John" />
                </div>
                <div className="space-y-2">
                  <Label>Activity / Focus</Label>
                  <Input value={formData.activity} onChange={e => handleInputChange('activity', e.target.value)} placeholder="e.g. Bowling" />
                </div>
                <div className="space-y-2">
                  <Label>Location Setting</Label>
                  <select value={formData.location} onChange={e => handleInputChange('location', e.target.value)} className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md p-2">
                    <option value="">-- Select --</option>
                    <option value="Community">Offsite Community</option>
                    <option value="Onsite">Onsite Centre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Session Time</Label>
                  <select value={formData.timeType} onChange={e => handleInputChange('timeType', e.target.value)} className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md p-2">
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="All Day">All Day</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specific Participation / Actions</Label>
                <Textarea 
                  rows={2} 
                  value={formData.specificActivity} 
                  onChange={e => handleInputChange('specificActivity', e.target.value)} 
                  placeholder="e.g. engaged strongly with the art project, taking time to choose colours."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Overall Mood</Label>
                  <select value={formData.mood} onChange={e => handleInputChange('mood', e.target.value)} className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md p-2">
                    <option value="">-- Select --</option>
                    <option value="Calm">Calm & Content</option>
                    <option value="Positive">Positive & Enthusiastic</option>
                    <option value="Anxious">Anxious</option>
                    <option value="Fatigued">Fatigued</option>
                    <option value="Focused">Focused</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Behavior / Engagement</Label>
                  <select value={formData.minorBehavior} onChange={e => handleInputChange('minorBehavior', e.target.value)} className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-800 rounded-md p-2">
                    <option value="">-- Select --</option>
                    <option value="Cooperative">Cooperative</option>
                    <option value="Distracted">Distracted / Needed Prompts</option>
                    <option value="Minor agitation">Mild Agitation</option>
                    <option value="Refusal">Task Refusal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Progress Toward Goals</Label>
                <Textarea 
                  rows={2} 
                  value={formData.goalProgression} 
                  onChange={e => handleInputChange('goalProgression', e.target.value)} 
                  placeholder={`e.g. actively participated in group discussions, fulfilling social goals.`}
                />
              </div>

              <div className="space-y-2">
                <Label>Closing Reflection / Next Steps</Label>
                <Input value={formData.activityReflection} onChange={e => handleInputChange('activityReflection', e.target.value)} placeholder="e.g. Will offer more sensory breaks next week." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-4 space-y-4">
            <Card className="shadow-lg border-indigo-200 overflow-hidden flex flex-col">
              <CardHeader className="bg-indigo-600 dark:bg-indigo-800 text-white p-4 shrink-0 shadow-sm relative z-10">
                <CardTitle className="text-base flex justify-between items-center">
                  <span>Generated Note</span>
                  {previewText.length > 5 && (
                    <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest font-black">Ready</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-900 border-b border-indigo-100 dark:border-indigo-900/50">
                {!formData.name ? (
                   <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 p-8 text-center">
                     <User className="w-8 h-8 mb-4 opacity-50" />
                     <p className="text-sm font-medium">Select or type a Client Name to begin generating the narrative.</p>
                   </div>
                ) : (
                  <div className="p-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {previewText}
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-white dark:bg-slate-950 p-4 shrink-0 flex flex-col gap-3">
                <Button 
                  onClick={handleCopy} 
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                  disabled={!formData.name}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Clinical Note'}
                </Button>
                <Button variant="outline" onClick={handleNextClient} className="w-full gap-2 text-slate-600 dark:text-slate-400">
                  <RefreshCw className="w-4 h-4" /> Next Client in Group
                </Button>
              </CardFooter>
            </Card>

            <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl flex flex-col gap-2">
              <h4 className="font-black text-xs uppercase tracking-[0.1em] text-blue-400 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> The Polish Protocol
              </h4>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                Generate your raw sequence above, then copy the clinical note into your organization's approved reporting system. Ensures professional accountability in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

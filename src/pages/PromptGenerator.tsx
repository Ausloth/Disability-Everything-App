import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Copy, Sparkles, Plus, Loader2, ArrowRight, Dices, Layers, ChevronLeft, CheckCircle2, ChevronRight } from 'lucide-react'

const TEMPLATES = [
  { id: '1', title: 'Community Gardening', category: 'Therapeutic', emoji: '🌱', subtitle: 'Horticulture & nature appreciation' },
  { id: '2', title: 'Culinary Masterclass', category: 'Life Skills', emoji: '🍳', subtitle: 'Cooking & nutrition basics' },
  { id: '3', title: 'Creative Art Studio', category: 'Creative', emoji: '🎨', subtitle: 'Self-expression through visual arts' },
  { id: '4', title: 'Travel Training', category: 'Life Skills', emoji: '🚆', subtitle: 'Public transport & navigation' },
  { id: '5', title: 'Hydrotherapy', category: 'Physical', emoji: '🏊', subtitle: 'Low impact water exercises' },
  { id: '6', title: 'Tech & Gaming Hub', category: 'Social', emoji: '💻', subtitle: 'Digital literacy & multiplayer gaming' },
]

export function PromptGenerator() {
  const [screen, setScreen] = useState<'home' | 'form' | 'result'>('home')
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null)
  
  const [formData, setFormData] = useState({
    activityName: '',
    suburbCity: '',
    durationWeeks: '12',
    activityBlurb: '',
    dayOfWeek: '',
    startDate: '',
    sessionType: 'Morning (9:30am - 12:30pm)',
    availableTransport: '',
    locationPreference: 'Mix of Onsite & Offsite',
    minParticipants: '2',
    maxParticipants: '5',
    accessibilityLevel: 'Medium (Step access okay)',
    capacityLevel: 'Medium',
    groupSizeSupportRatio: '1:3',
    ndisGoals: '',
    costPerPerson: '0',
    targetParticipantProfile: '',
    additionalNotes: ''
  })

  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setFormData({
      ...formData,
      activityName: template.title,
      activityBlurb: template.subtitle
    })
    setScreen('form')
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    
    // Build Prompt
    setTimeout(() => {
      const prompt = `Act as an expert Disability Support Program Coordinator for an NDIS Day Service.

I need a comprehensive Activity Outline and Support Guide for an upcoming program. Below is the configuration context:

--- PROGRAM LOGISTICS ---
Name: ${formData.activityName}
Summary Concept: ${formData.activityBlurb}
Location/Suburb: ${formData.suburbCity || 'Not specified'}
Location Style: ${formData.locationPreference}
Duration: ${formData.durationWeeks} Weeks
Session Timing: ${formData.dayOfWeek ? formData.dayOfWeek + 's, ' : ''}${formData.sessionType}
Transport Method: ${formData.availableTransport || 'Standard/Not specified'}

--- CAPACITY & PROFILE ---
Participants: ${formData.minParticipants} to ${formData.maxParticipants} clients
Support Ratio Guidance: ${formData.groupSizeSupportRatio}
Target Profile: ${formData.targetParticipantProfile || 'Adults in a day service'}
Accessibility Level: ${formData.accessibilityLevel}
Complexity Level: ${formData.capacityLevel}

--- NDIS GOALS & FUNDING ---
Supported NDIS Goals: ${formData.ndisGoals || 'Social participation, capacity building'}
Estimated Weekly Cost: $${formData.costPerPerson}

--- ADDITIONAL MANAGER NOTES ---
${formData.additionalNotes || 'None'}

Please provide a structured program outline containing the following sections:
1. Executive Summary & Core Objectives (Aligned to NDIS pricing constraints and capacity building goals)
2. Week-by-Week Breakdown (Provide a progressive ${formData.durationWeeks}-week curriculum)
3. Materials, Budget, and Equipment needed
4. Detailed Standard Session Plan (Arrival, Main task, Break, Pack-down, Reflection)
5. Comprehensive Risk Assessment matrix & Mitigation strategies for the venue type.
6. Engagement Strategies tailored to the target profile and support ratio.
7. Post-program feedback & outcome tracking suggestions.`
      
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
      setScreen('result')
    }, 800)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt)
  }

  if (screen === 'home') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400 mb-2">Program Catalog</h1>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 max-w-xl">
              Select an activity template below to customize and generate a professional LLM prompt. You can use these generated prompts in ChatGPT or Claude.
            </p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800"
            onClick={() => handleSelectTemplate(TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)])}
          >
            <Dices className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Surprise Me
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {TEMPLATES.map((tpl) => (
            <Card 
              key={tpl.id} 
              className="cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
              onClick={() => handleSelectTemplate(tpl)}
            >
              <CardContent className="p-6">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{tpl.emoji}</div>
                <h3 className="font-bold text-lg mb-1">{tpl.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{tpl.subtitle}</p>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="opacity-80">{tpl.category}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            className="cursor-pointer border-dashed hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center min-h-[200px]"
            onClick={() => handleSelectTemplate({ id: 'custom', title: '', category: 'Custom', emoji: '✨', subtitle: '' })}
          >
            <div className="text-center p-6 text-muted-foreground">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">Start from Scratch</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (screen === 'form') {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border">{selectedTemplate?.emoji}</div>
              <div>
                <CardTitle className="text-lg">Configure Program Outline</CardTitle>
                <CardDescription>Customizing {selectedTemplate?.title || 'Custom Activity'}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setScreen('home')}>Cancel</Button>
              <Button size="sm" onClick={handleGenerate} disabled={!formData.activityName || isGenerating} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Prompt'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-dashed">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Program Name *</Label>
                <Input 
                  value={formData.activityName} 
                  onChange={e => setFormData({...formData, activityName: e.target.value})}
                  className="bg-transparent border-t-0 border-l-0 border-r-0 rounded-none border-b-2 border-slate-200 focus-visible:ring-0 focus-visible:border-emerald-500 px-0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Location Suburb</Label>
                <Input 
                  placeholder="e.g. Frankston"
                  value={formData.suburbCity} 
                  onChange={e => setFormData({...formData, suburbCity: e.target.value})}
                  className="bg-transparent border-t-0 border-l-0 border-r-0 rounded-none border-b-2 border-slate-200 focus-visible:ring-0 focus-visible:border-emerald-500 px-0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Duration (Weeks) *</Label>
                <div className="flex items-center gap-2 border-b-2 border-slate-200 focus-within:border-emerald-500">
                  <Input 
                    type="number"
                    min="1"
                    value={formData.durationWeeks} 
                    onChange={e => setFormData({...formData, durationWeeks: e.target.value})}
                    className="bg-transparent border-0 focus-visible:ring-0 px-0 text-center"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Activity Blurb / Concept *</Label>
                <Textarea 
                  rows={2}
                  value={formData.activityBlurb} 
                  onChange={e => setFormData({...formData, activityBlurb: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Logistics */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Logistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Day (Optional)</Label>
                    <select 
                      className="w-full text-sm bg-slate-50 dark:bg-slate-900 p-2.5 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                    >
                      <option value="">Any</option>
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Start Date (Opt)</Label>
                    <Input 
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900 h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Session Timing</Label>
                  <select 
                    className="w-full text-sm bg-slate-50 dark:bg-slate-900 p-2.5 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                    value={formData.sessionType}
                    onChange={e => setFormData({...formData, sessionType: e.target.value})}
                  >
                    <option>All Day</option>
                    <option>Morning (9:30am - 12:30pm)</option>
                    <option>Afternoon (1:00pm - 4:00pm)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Transport Method</Label>
                  <Input 
                    placeholder="e.g. Centre Bus"
                    value={formData.availableTransport}
                    onChange={e => setFormData({...formData, availableTransport: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Location Type</Label>
                  <select 
                    className="w-full text-sm bg-slate-50 dark:bg-slate-900 p-2.5 rounded-md border border-slate-200 focus:outline-none focus:border-emerald-500"
                    value={formData.locationPreference}
                    onChange={e => setFormData({...formData, locationPreference: e.target.value})}
                  >
                    <option>Mix of Onsite & Offsite</option>
                    <option>Onsite only</option>
                    <option>Offsite only</option>
                  </select>
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Capacity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Min Parts.</Label>
                    <Input 
                      type="number"
                      value={formData.minParticipants}
                      onChange={e => setFormData({...formData, minParticipants: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900 h-10 text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Max Parts.</Label>
                    <Input 
                      type="number"
                      value={formData.maxParticipants}
                      onChange={e => setFormData({...formData, maxParticipants: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900 h-10 text-center"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Accessibility & Complexity</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-md border border-slate-200 focus:outline-none"
                      value={formData.accessibilityLevel}
                      onChange={e => setFormData({...formData, accessibilityLevel: e.target.value})}
                    >
                      <option value="High (All abilities)">All abilities</option>
                      <option value="Medium (Step access okay)">Some Mobility Ref.</option>
                      <option value="Low">High Mobility Req.</option>
                    </select>
                    <select 
                      className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 p-2.5 rounded-md border border-slate-200 focus:outline-none"
                      value={formData.capacityLevel}
                      onChange={e => setFormData({...formData, capacityLevel: e.target.value})}
                    >
                      <option value="Low">Low Complexity</option>
                      <option value="Medium">Med. Complexity</option>
                      <option value="High">High Complexity</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Support Ratio Guidance</Label>
                  <Input 
                    placeholder="e.g. 1:3 or 1:4 suitable"
                    value={formData.groupSizeSupportRatio}
                    onChange={e => setFormData({...formData, groupSizeSupportRatio: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 h-10"
                  />
                </div>
              </div>
              
              {/* Additional Details */}
              <div className="space-y-5 md:col-span-2 pt-6 border-t border-dashed">
                 <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Additional Details</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label className="text-xs tracking-wide">Supported NDIS Goals</Label>
                    <Input 
                      placeholder="e.g. Social Participation..."
                      value={formData.ndisGoals}
                      onChange={e => setFormData({...formData, ndisGoals: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs tracking-wide">Estimated Weekly Cost ($)</Label>
                      <Input 
                        type="number"
                        value={formData.costPerPerson}
                        onChange={e => setFormData({...formData, costPerPerson: e.target.value})}
                        className="bg-slate-50 dark:bg-slate-900"
                      />
                   </div>
                 </div>
                 
                 <div className="space-y-2 mt-4">
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Target Participant Profile</Label>
                    <Textarea 
                      rows={2}
                      value={formData.targetParticipantProfile}
                      onChange={e => setFormData({...formData, targetParticipantProfile: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                 </div>

                 <div className="space-y-2 mt-4">
                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Additional Context/Ideas</Label>
                    <Textarea 
                      rows={2}
                      value={formData.additionalNotes}
                      onChange={e => setFormData({...formData, additionalNotes: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900"
                    />
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Prompt Generated successfully
          </h2>
          <p className="text-muted-foreground mt-1">Copy the text below and paste it into ChatGPT, Claude, or your preferred LLM.</p>
        </div>
        <Button variant="outline" onClick={() => setScreen('form')} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Edit Configuration
        </Button>
      </div>

      <Card className="overflow-hidden border-emerald-100 dark:border-emerald-900/30">
        <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-3 flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/30">
          <span className="font-semibold text-xs text-slate-500 uppercase tracking-widest">LLM Prompt Instruction</span>
          <Button 
            onClick={handleCopy} 
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-sm"
          >
            <Copy className="w-4 h-4" /> Copy Prompt
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-slate-950 selection:bg-emerald-200 dark:selection:bg-emerald-900">
          <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {generatedPrompt}
          </pre>
        </div>
      </Card>
      
      <div className="mt-6 p-4 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl flex items-start gap-3">
        <div className="text-xl">💡</div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-400">What's Next?</h4>
          <p className="text-sm text-emerald-800 dark:text-emerald-500 mt-1 max-w-2xl">
            Click the Copy button above, then drop it into your preferred LLM (like ChatGPT). Ensure your LLM responds without cutting it short (it may be long!). Once generated, you can save the result manually to your activity catalogue.
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Sparkles, Plus, Loader2 } from 'lucide-react'

// Constants derived from original app
const SUPPORT_LEVELS = ['Low Support (1:3+)', 'Medium Support (1:2)', 'High Support (1:1 / 2:1)']
const LOCATIONS = ['Onsite', 'Offsite Community', 'Hybrid']

export function PromptGenerator() {
  const [formData, setFormData] = useState({
    city: '',
    transport: '',
    activityName: '',
    supportLevel: SUPPORT_LEVELS[0],
    location: LOCATIONS[0],
    focusAreas: '',
    additionalNeeds: ''
  })
  
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    
    // Simulating prompt generation / structuring
    setTimeout(() => {
      const prompt = `Act as an expert Disability Support Program Coordinator for a Day Service based in ${formData.city || 'Australia'}.
      
I need a comprehensive Activity Outline and Support Guide for a program called "${formData.activityName}".

Context & Parameters:
- Support Ratio/Level: ${formData.supportLevel}
- Location: ${formData.location}
- Transport Available: ${formData.transport || 'Standard'}
- Focus Areas (Participant Goals): ${formData.focusAreas}
- Additional Needs / Risks: ${formData.additionalNeeds}

Please provide a structured 2-hour session plan including:
1. Activity Objectives (aligned to standard NDIS goals)
2. Materials & Equipment Needed
3. Step-by-Step Session Plan (Arrival, Main Activity, Pack down)
4. Key Risk Assessments & Mitigation Strategies
5. Engagement Strategies for the specified support level
`
      setGeneratedPrompt(prompt)
      setIsGenerating(false)
    }, 600)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Prompt Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate structured prompts to create high-quality disability day service program outlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
            <CardDescription>Fill in the context to generate a tailored outline prompt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actName">Activity Name</Label>
              <Input 
                id="actName" 
                placeholder="e.g. Community Cooking, Art Therapy..." 
                value={formData.activityName}
                onChange={e => setFormData({ ...formData, activityName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City / Suburb</Label>
                <Input 
                  id="city" 
                  placeholder="e.g. Melbourne" 
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transport">Transport</Label>
                <Input 
                  id="transport" 
                  placeholder="e.g. 12-Seater Bus" 
                  value={formData.transport}
                  onChange={e => setFormData({ ...formData, transport: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportLevel">Support Level</Label>
                <select 
                  id="supportLevel" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.supportLevel}
                  onChange={e => setFormData({ ...formData, supportLevel: e.target.value })}
                >
                  {SUPPORT_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location Type</Label>
                <select 
                  id="location" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                >
                  {LOCATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusAreas">Focus Areas & Goals</Label>
              <Textarea 
                id="focusAreas" 
                placeholder="e.g. Social skills, fine motor skills, money handling..." 
                className="h-20"
                value={formData.focusAreas}
                onChange={e => setFormData({ ...formData, focusAreas: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNeeds">Additional Needs / Notes</Label>
              <Textarea 
                id="additionalNeeds" 
                placeholder="e.g. Wheelchair accessible venues only, sensory breaks required..." 
                className="h-20"
                value={formData.additionalNeeds}
                onChange={e => setFormData({ ...formData, additionalNeeds: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} disabled={!formData.activityName || isGenerating} className="w-full gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate AI Prompt
            </Button>
          </CardFooter>
        </Card>

        {/* Output Column */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1 flex flex-col hidden lg:flex">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Generated Prompt</CardTitle>
                  <CardDescription>Copy this into ChatGPT, Claude, or Gemini</CardDescription>
                </div>
                {generatedPrompt && (
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              {generatedPrompt ? (
                <Textarea 
                  readOnly 
                  value={generatedPrompt} 
                  className="w-full h-full min-h-[400px] border-0 focus-visible:ring-0 rounded-none resize-none p-6 text-sm bg-muted/20"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-4 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-8 h-8 opacity-20" />
                  </div>
                  <p>Fill out the details and click generate to create a prompt.</p>
                </div>
              )}
            </CardContent>
            {generatedPrompt && (
               <CardFooter className="border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-end p-4">
                  <Button variant="secondary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Save to Activity Catalogue
                  </Button>
               </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

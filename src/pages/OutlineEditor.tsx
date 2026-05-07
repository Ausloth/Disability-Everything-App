import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore, ActivityOutline, OutlineWeek } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Copy, Save, FileText, CalendarDays, Sparkles, AlertCircle } from 'lucide-react'

// Simple helper to add weeks to a date string
function getWeekDate(startDateStr: string, weekIndex: number) {
  if (!startDateStr) return 'TBA'
  const date = new Date(startDateStr)
  if (isNaN(date.getTime())) return 'TBA'
  date.setDate(date.getDate() + (weekIndex * 7))
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function OutlineEditor() {
  const { outlineId } = useParams()
  const navigate = useNavigate()
  const { outlines, updateOutline, user } = useStore()
  
  const [outline, setOutline] = useState<ActivityOutline | null>(null)
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'week' | 'document'>('week')

  useEffect(() => {
    const found = outlines.find(o => o.id === outlineId)
    if (found) {
      setOutline(found)
    }
  }, [outlineId, outlines])

  if (!outline) return <div>Loading...</div>

  const selectedWeek = outline.weeks.find(w => w.weekNumber === selectedWeekNum)

  const handleUpdateOutline = (updates: Partial<ActivityOutline>) => {
    const updated = { ...outline, ...updates }
    setOutline(updated)
    updateOutline(updated)
  }

  const handleUpdateWeek = (weekNum: number, updates: Partial<OutlineWeek>) => {
    const updatedWeeks = outline.weeks.map(w => 
      w.weekNumber === weekNum ? { ...w, ...updates } : w
    )
    handleUpdateOutline({ weeks: updatedWeeks })
  }

  const handleDuplicatePrevious = () => {
    if (selectedWeekNum <= 1) return
    const prevWeek = outline.weeks.find(w => w.weekNumber === selectedWeekNum - 1)
    if (prevWeek) {
      handleUpdateWeek(selectedWeekNum, {
        goalProgression: prevWeek.goalProgression,
        tasksContent: prevWeek.tasksContent,
        locationTarget: prevWeek.locationTarget,
        materialsCost: prevWeek.materialsCost,
        staffGuide: prevWeek.staffGuide,
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/activities')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{outline.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground text-sm font-semibold mt-1">
              <span className="uppercase tracking-wider">
                {outline.style} Outline • {outline.durationWeeks} Weeks
              </span>
              <span>•</span>
              <div className="flex items-center gap-2">
                <span className="font-normal text-xs">Starts:</span> 
                <Input 
                  type="date" 
                  value={outline.startDate} 
                  onChange={e => handleUpdateOutline({ startDate: e.target.value })}
                  className="h-7 px-2 py-0 text-xs w-auto bg-transparent border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'week' ? 'default' : 'outline'} 
            onClick={() => setViewMode('week')}
            className="gap-2 shadow-sm"
          >
            <CalendarDays className="w-4 h-4" /> Week-by-Week
          </Button>
          <Button 
            variant={viewMode === 'document' ? 'default' : 'outline'} 
            onClick={() => setViewMode('document')}
            className="gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" /> Document View
          </Button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="md:col-span-1 h-fit shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col divide-y">
                {outline.weeks.map((week, index) => (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeekNum(week.weekNumber)}
                    className={`p-3 text-left transition-colors hover:bg-slate-50 ${selectedWeekNum === week.weekNumber ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-sm">Week {week.weekNumber}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{getWeekDate(outline.startDate, index)}</div>
                    </div>
                    {week.variationNote && (
                      <div className="text-[10px] uppercase font-bold text-amber-600 mt-1 truncate">
                        ⚠️ {week.variationNote}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Editor */}
          <div className="md:col-span-3 space-y-6">
            <Card className="shadow-sm border-emerald-100 dark:border-emerald-900/30">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30 flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle>Week {selectedWeekNum} Configuration</CardTitle>
                  <CardDescription>Scheduled for {getWeekDate(outline.startDate, selectedWeekNum - 1)}</CardDescription>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={handleDuplicatePrevious} disabled={selectedWeekNum === 1} className="gap-2 bg-white dark:bg-slate-900">
                     <Copy className="w-3 h-3" /> Same as W{selectedWeekNum - 1}
                   </Button>
                   <Button variant="secondary" size="sm" className="gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60 shadow-none border border-emerald-200 dark:border-emerald-800">
                     <Sparkles className="w-3 h-3 text-emerald-500" /> AI Suggest content
                   </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {selectedWeek && (
                  <>
                    {outline.style === 'Recurring' && (
                      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-lg space-y-2">
                        <Label className="text-amber-800 dark:text-amber-500 flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" /> Variation Note (Optional)
                        </Label>
                        <Input 
                          placeholder="e.g. Barefoot Lawn Bowls instead of standard lanes"
                          className="bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/50"
                          value={selectedWeek.variationNote || ''}
                          onChange={e => handleUpdateWeek(selectedWeekNum, { variationNote: e.target.value })}
                        />
                        <p className="text-xs text-amber-700 dark:text-amber-600/80">In a Recurring program, leave this blank if it is a standard week. Fill this in if the activity changes significantly.</p>
                      </div>
                    )}

                    <div className="space-y-2">
                       <Label className="text-xs uppercase text-slate-500 tracking-wider font-bold">Tasks & Content</Label>
                       <Textarea 
                         rows={4} 
                         value={selectedWeek.tasksContent}
                         onChange={e => handleUpdateWeek(selectedWeekNum, { tasksContent: e.target.value })}
                         className="bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-emerald-500"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <Label className="text-xs uppercase text-slate-500 tracking-wider font-bold">Goal Progression / Focus</Label>
                         <Input 
                           value={selectedWeek.goalProgression}
                           onChange={e => handleUpdateWeek(selectedWeekNum, { goalProgression: e.target.value })}
                           className="bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-emerald-500"
                         />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-xs uppercase text-slate-500 tracking-wider font-bold">Location / Target Venue</Label>
                         <Input 
                           value={selectedWeek.locationTarget}
                           onChange={e => handleUpdateWeek(selectedWeekNum, { locationTarget: e.target.value })}
                           className="bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-emerald-500"
                         />
                       </div>
                    </div>

                    <div className="space-y-2 border-t pt-6">
                       <Label className="text-sm font-bold text-slate-800 dark:text-slate-200">Staff Guide & Facilitation Notes</Label>
                       <p className="text-xs text-muted-foreground mb-2">These notes are prominently displayed on the staff "My Day" dashboard.</p>
                       <Textarea 
                         rows={5} 
                         className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 focus-visible:ring-emerald-500"
                         value={selectedWeek.staffGuide}
                         onChange={e => handleUpdateWeek(selectedWeekNum, { staffGuide: e.target.value })}
                       />
                    </div>
                    
                    <div className="space-y-2">
                       <Label className="text-xs uppercase text-slate-500 tracking-wider font-bold">Materials & Cost</Label>
                       <Input 
                         value={selectedWeek.materialsCost}
                         onChange={e => handleUpdateWeek(selectedWeekNum, { materialsCost: e.target.value })}
                         className="bg-slate-50 dark:bg-slate-900 border-slate-200 focus-visible:ring-emerald-500"
                       />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="shadow-lg min-h-[800px] border-slate-200">
           <div className="p-8 md:p-16 max-w-5xl mx-auto space-y-12">
             <div className="text-center border-b pb-8">
               <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{outline.title}</h1>
               <div className="flex items-center justify-center gap-4 mt-4 text-slate-500 font-medium">
                 <span className="uppercase tracking-widest text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{outline.style} Program</span>
                 <span>•</span>
                 <span>{outline.durationWeeks} Weeks</span>
                 <span>•</span>
                 <span>Starts {new Date(outline.startDate).toLocaleDateString()}</span>
               </div>
             </div>

             {outline.weeks.map((week, index) => (
               <div key={week.id} className="break-inside-avoid">
                 <div className="flex items-center gap-4 border-b border-slate-200 pb-2 mb-4">
                   <h3 className="text-xl font-bold bg-slate-900 text-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">W{week.weekNumber}</h3>
                   <div>
                     <div className="text-sm font-semibold text-slate-500">{getWeekDate(outline.startDate, index)}</div>
                   </div>
                   {week.variationNote && (
                     <span className="ml-auto bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                       Variation: {week.variationNote}
                     </span>
                   )}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tasks & Content</h4>
                        <p className="text-sm whitespace-pre-wrap text-slate-700 leading-relaxed">{week.tasksContent || 'No content specified.'}</p>
                      </div>
                      <div className="bg-slate-50/80 p-5 border rounded-xl shadow-sm">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Staff Guide</h4>
                        <p className="text-sm text-slate-700 leading-relaxed italic">{week.staffGuide || 'No specific guidance.'}</p>
                      </div>
                   </div>
                   <div className="space-y-5 text-sm bg-slate-50/50 p-5 rounded-xl border border-dashed border-slate-200">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Goal / Focus</span>
                        <span className="text-slate-700 font-medium">{week.goalProgression || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Location</span>
                        <span className="text-slate-700 font-medium flex items-center gap-2">📍 {week.locationTarget || '-'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Materials & Costs</span>
                        <span className="text-slate-700 font-medium flex items-center gap-2">📦 {week.materialsCost || '-'}</span>
                      </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </Card>
      )}
    </div>
  )
}

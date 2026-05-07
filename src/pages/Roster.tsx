import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, ChevronRight, User, MapPin, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useStore } from "@/store/useStore"

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const SESSIONS = ['Morning', 'Afternoon']

export function Roster() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null)
  const { user } = useStore()
  
  const isManager = user?.role === 'Admin' || user?.role === 'Coordinator'

  // Mock schedule data
  const mockSchedule = [
    { id: 1, day: 'Mon', session: 'Morning', activity: 'Community Gardening', location: 'Box Hill', clients: 4, staff: 2, color: 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 border-green-900 dark:text-green-400',
      outline: {
        objectives: 'Improve fine motor skills, understand plant lifecycles, and work collaboratively in an outdoor environment.',
        materials: 'Gardening gloves, trowels, seeds, watering cans, sunscreen, hats.',
        plan: '1. Arrival and safety briefing (15m)\n2. Plant preparation and soil turning (45m)\n3. Break (15m)\n4. Watering and clean up (30m)\n5. Reflection (15m)',
        risks: 'Heat exhaustion, sharp tools, soilborne bacteria. Mitigation: mandatory breaks, gloves, sun safety gear.',
        engagement: 'Assign specific roles based on ability. Use visual aids for planting depth.'
      }
    },
    { id: 2, day: 'Mon', session: 'Afternoon', activity: 'Art Therapy', location: 'Onsite', clients: 3, staff: 1, color: 'bg-purple-100 border-purple-200 text-purple-800 dark:bg-purple-900/30 border-purple-900 dark:text-purple-400',
      outline: null
    },
    { id: 3, day: 'Tue', session: 'Morning', activity: 'Swimming', location: 'Leisure Centre', clients: 2, staff: 2, color: 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 border-blue-900 dark:text-blue-400',
      outline: {
        objectives: 'Water safety awareness, gentle physical exercise, and sensory regulation.',
        materials: 'Swimwear, towels, floatation devices, spare dry clothes.',
        plan: '1. Travel and changing (30m)\n2. Water entry and safety overview (15m)\n3. Free swimming and guided games (45m)\n4. Changing and return (30m)',
        risks: 'Drowning risk, slips on wet surfaces. Mitigation: 1:1 supervision in water, clear safety boundaries.',
        engagement: 'Use games like fetching submerged objects, continuous encouragement.'
      }
    },
    { id: 4, day: 'Wed', session: 'Morning', activity: 'Cooking Masterclass', location: 'Onsite Kitchen', clients: 5, staff: 2, color: 'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-900/30 border-amber-900 dark:text-amber-400',
      outline: null
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isManager ? 'Timetable Management' : 'Timetable'}</h1>
          <p className="text-muted-foreground mt-2">
            {isManager 
              ? 'Manage sessions, allocate staff, and track attendance.' 
              : 'View your upcoming sessions and review activity outlines & risk assessments.'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border rounded-md mr-2">
            <Button variant="ghost" size="icon" className="h-9 w-9"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-medium w-32 text-center">Aug 12 - Aug 16</span>
            <Button variant="ghost" size="icon" className="h-9 w-9"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="outline">Today</Button>
          {isManager && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Session
            </Button>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[100px_repeat(5,minmax(180px,1fr))] border-b bg-muted/40 min-w-[1000px]">
            <div className="p-4 border-r font-medium text-sm text-center flex items-center justify-center">
              <span className="text-muted-foreground">Session</span>
            </div>
            {DAYS.map(day => (
              <div key={day} className="p-4 border-r last:border-r-0 font-medium text-center text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col min-w-[1000px]">
            {SESSIONS.map(session => (
              <div key={session} className="grid grid-cols-[100px_repeat(5,minmax(180px,1fr))] border-b last:border-b-0 min-h-[220px]">
                <div className="p-4 border-r bg-muted/20 flex flex-col items-center justify-center">
                  <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest text-center whitespace-pre-wrap">
                    {session.split('').join('\n')}
                  </span>
                </div>
                
                {DAYS.map(day => {
                  const sessions = mockSchedule.filter(s => s.day === day && s.session === session)
                  return (
                    <div key={`${day}-${session}`} className="p-2 border-r last:border-r-0 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors cursor-crosshair">
                      <div className="space-y-2 h-full rounded-md">
                        {sessions.map(s => (
                          <div key={s.id} onClick={() => setSelectedActivity(s)} className={`p-3 rounded-lg border shadow-sm flex flex-col gap-2 ${s.color} transition-all hover:scale-[1.02] cursor-pointer`}>
                            <h4 className="font-bold text-sm leading-tight">{s.activity}</h4>
                            <div className="flex items-center gap-1.5 text-xs opacity-90">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{s.location}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs font-medium opacity-90 border-t border-current/10 pt-2">
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <User className="w-3 h-3" />
                                <span>{s.clients} Clients</span>
                              </div>
                              <div className="whitespace-nowrap">{s.staff} Staff</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activity Outline Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedActivity.activity}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {selectedActivity.location}
                  </span>
                  <span>
                    {selectedActivity.day} • {selectedActivity.session}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {selectedActivity.outline ? (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold tracking-tight">Objectives</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedActivity.outline.objectives}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold tracking-tight">Materials & Equipment</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedActivity.outline.materials}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold tracking-tight">Session Plan</h4>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-4 rounded-md">
                        {selectedActivity.outline.plan}
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-semibold tracking-tight text-amber-700 dark:text-amber-500">Risks & Mitigation</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedActivity.outline.risks}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold tracking-tight text-blue-700 dark:text-blue-500">Engagement Strategies</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedActivity.outline.engagement}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 bg-muted/20 border border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No activity outline exists for this session yet.</p>
                    {isManager && (
                      <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Outline / Connect to AI
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="pt-4 border-t flex flex-wrap gap-4 text-sm mt-4">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-md p-3">
                    <h5 className="font-semibold mb-2">Staff Allocated ({selectedActivity.staff})</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2"><User className="w-3 h-3" /> Jane Doe (Lead)</li>
                      {selectedActivity.staff > 1 && <li className="flex items-center gap-2"><User className="w-3 h-3" /> Mark T</li>}
                    </ul>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border rounded-md p-3">
                    <h5 className="font-semibold mb-2">Clients Attending ({selectedActivity.clients})</h5>
                    <ul className="text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">Alice S. (1:3)</li>
                      <li className="flex items-center gap-2">Bobby J. (1:1)</li>
                      {selectedActivity.clients > 2 && <li className="text-xs mt-2 italic">+ {selectedActivity.clients - 2} more</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

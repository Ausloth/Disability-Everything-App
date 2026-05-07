import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useStore } from "@/store/useStore"
import { MapPin, Users, Clock, FileText, CheckCircle2, Navigation, FileBox, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const { user, schedules, activities, outlines } = useStore()

  // Get today's scheduled activities for this user
  const mySchedules = schedules.filter(s => s.staff.includes(user?.id || ''))

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-400">My Day</h1>
        <p className="text-muted-foreground mt-2">Your schedule and session guides for today.</p>
      </div>

      <div className="space-y-6">
        {mySchedules.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500">
             You have no scheduled activities today.
          </div>
        ) : (
          mySchedules.map((schedule) => {
            const activity = activities.find(a => a.id === schedule.activityId)
            const outline = outlines.find(o => o.id === schedule.outlineId)
            
            // Safe fallback if outline or activity is missing
            if (!activity) return null
            
            // Find the specific week
            const week = outline?.weeks.find(w => w.weekNumber === schedule.currentWeek)

            return (
              <Card key={schedule.id} className="overflow-hidden border-emerald-100 dark:border-emerald-900/30">
                <CardHeader className="bg-emerald-50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/30 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <span className="text-2xl">{activity.emoji}</span>
                         <CardTitle className="text-xl">
                           {activity.name}
                         </CardTitle>
                       </div>
                       <CardDescription className="text-emerald-800 dark:text-emerald-400 font-medium flex items-center gap-2">
                         Week {schedule.currentWeek}
                         {week?.variationNote && (
                           <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
                             <AlertCircle className="w-3 h-3" /> Variation: {week.variationNote}
                           </span>
                         )}
                       </CardDescription>
                     </div>
                     <div className="flex flex-col items-start sm:items-end gap-1 text-sm text-slate-600 dark:text-slate-400">
                       <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-200">
                         <Clock className="w-4 h-4 text-emerald-600" /> {schedule.time}
                       </span>
                       <span className="flex items-center gap-2">
                         <MapPin className="w-4 h-4" /> {week?.locationTarget || activity.location}
                       </span>
                       <span className="flex items-center gap-2">
                         <Users className="w-4 h-4" /> {schedule.clients.length} Clients ({schedule.clients.join(', ')})
                       </span>
                     </div>
                  </div>
                </CardHeader>

                {week ? (
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                      
                      {/* Left: Content & Tasks */}
                      <div className="p-6 space-y-6">
                         <div>
                           <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Tasks & Content</h4>
                           <p className="text-sm slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{week.tasksContent}</p>
                         </div>
                         
                         <div>
                           <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Client Goals</h4>
                           <p className="text-sm slate-700 dark:text-slate-300 italic">{week.goalProgression}</p>
                         </div>

                         <div>
                           <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Materials & Cost</h4>
                           <p className="text-sm slate-700 dark:text-slate-300">{week.materialsCost}</p>
                         </div>
                      </div>

                      {/* Right: Staff Guide */}
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                         <div className="flex items-center gap-2 mb-3">
                           <Navigation className="w-5 h-5 text-emerald-600" />
                           <h4 className="font-bold text-slate-900 dark:text-slate-100">Staff Guide & Facilitation</h4>
                         </div>
                         <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                           {week.staffGuide}
                         </div>
                      </div>

                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-6 text-center text-slate-500">
                     No week-by-week outline attached for this activity.
                  </CardContent>
                )}

                <CardFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t p-4 flex flex-wrap gap-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 sm:flex-none" onClick={() => window.location.hash = `#/journal?scheduleId=${schedule.id}`}>
                    <FileText className="w-4 h-4" /> Session Notes
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                    <CheckCircle2 className="w-4 h-4" /> Attendance
                  </Button>
                  <Button variant="ghost" className="gap-2 ml-auto text-slate-500 w-full sm:w-auto" onClick={() => window.location.hash = `#/activities/outlines/${outline?.id}`}>
                    <FileBox className="w-4 h-4" /> Full Outline
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

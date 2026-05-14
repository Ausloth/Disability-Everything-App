import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileBox, MapPin, Users, Edit2, ListChecks } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useNavigate } from "react-router-dom"

export function Activities() {
  const { user, activities, outlines } = useStore()
  const navigate = useNavigate()
  const isManager = user?.role === 'Admin' || user?.role === 'Coordinator'
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Catalogue</h1>
          <p className="text-muted-foreground mt-2">Manage all programs and activities run at your center.</p>
        </div>
        {isManager && (
          <Button 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigate("/activities/outlines/new")}
          >
            <Plus className="w-4 h-4" />
            New Program Map
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search activities..." />
        </div>
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm flex-none">
          <option>All Categories</option>
          <option>Outdoors</option>
          <option>Creative</option>
          <option>Life Skills</option>
        </select>
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm flex-none">
          <option>All Levels</option>
          <option>Low Support</option>
          <option>Medium Support</option>
          <option>High Support</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => {
          const hasOutline = outlines.find(o => o.activityId === activity.id)
          
          return (
            <Card key={activity.id} className="group hover:border-primary/50 transition-colors flex flex-col h-full shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold">{activity.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center rounded-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-300">
                      {activity.category}
                    </span>
                    <span className="inline-flex items-center rounded-sm bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-400">
                      {activity.level}
                    </span>
                  </div>
                </div>
                <div className="text-3xl ml-2">{activity.emoji}</div>
              </CardHeader>
              <CardContent className="mt-auto pt-4 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{activity.location}</span>
                  </div>
                </div>
                
                <div className="mt-auto border-t pt-4">
                  {hasOutline ? (
                    <div className="flex gap-2">
                       <Button 
                         variant="secondary" 
                         className="flex-1 gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                         onClick={() => navigate(`/activities/outlines/${hasOutline.id}`)}
                       >
                         <ListChecks className="w-4 h-4" /> Edit Program
                       </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-slate-500 border-dashed"
                      onClick={() => navigate(`/activities/outlines/new?activityId=${activity.id}`)}
                    >
                       <Plus className="w-4 h-4" /> Create Outline Map
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

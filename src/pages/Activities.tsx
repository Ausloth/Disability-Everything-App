import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileBox, MapPin, Users } from "lucide-react"
import { useStore } from "@/store/useStore"

export function Activities() {
  const { user } = useStore()
  const isManager = user?.role === 'Admin' || user?.role === 'Coordinator'
  
  const mockActivities = [
    { id: 1, name: 'Community Gardening', category: 'Outdoors', location: 'Box Hill', level: 'Medium Support', emoji: '🌱' },
    { id: 2, name: 'Art Therapy', category: 'Creative', location: 'Onsite', level: 'Low Support', emoji: '🎨' },
    { id: 3, name: 'Swimming', category: 'Physical', location: 'Leisure Centre', level: 'High Support', emoji: '🏊' },
    { id: 4, name: 'Cooking Masterclass', category: 'Life Skills', location: 'Onsite Kitchen', level: 'Medium Support', emoji: '🍳' },
    { id: 5, name: 'Money Management', category: 'Life Skills', location: 'Onsite', level: 'Low Support', emoji: '💵' },
    { id: 6, name: 'Sensory Room', category: 'Therapy', location: 'Onsite', level: 'High Support', emoji: '✨' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Catalogue</h1>
          <p className="text-muted-foreground mt-2">Manage all programs and activities run at your center.</p>
        </div>
        {isManager && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Activity
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
        {mockActivities.map(activity => (
          <Card key={activity.id} className="group hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">{activity.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center rounded-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-300">
                    {activity.category}
                  </span>
                  <span className="inline-flex items-center rounded-sm bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-400">
                    {activity.level}
                  </span>
                </div>
              </div>
              <div className="text-3xl">{activity.emoji}</div>
            </CardHeader>
            <CardContent className="mt-auto pt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{activity.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

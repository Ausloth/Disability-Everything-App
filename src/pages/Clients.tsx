import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, User, Filter } from "lucide-react"
import { useStore } from "@/store/useStore"

export function Clients() {
  const { user } = useStore()
  const isManager = user?.role === 'Admin' || user?.role === 'Coordinator'

  const mockClients = [
    { id: 1, name: 'Alice Smith', ratio: '1:3', days: ['Mon', 'Tue', 'Wed'], status: 'Active', keyWorker: 'Sarah J' },
    { id: 2, name: 'Bob Jones', ratio: '1:1', days: ['Mon', 'Thu', 'Fri'], status: 'Active', keyWorker: 'Mark T' },
    { id: 3, name: 'Charlie Brown', ratio: '1:2', days: ['Tue', 'Wed', 'Thu'], status: 'Action Required', keyWorker: 'Sarah J' },
    { id: 4, name: 'Diana Prince', ratio: '1:4', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], status: 'Active', keyWorker: 'Emily W' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">Manage client profiles, support ratios, and availabilities.</p>
        </div>
        {isManager && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search clients..." />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Support Ratio</th>
                <th className="px-6 py-4 font-medium">Rostered Days</th>
                <th className="px-6 py-4 font-medium">Key Worker</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockClients.map(client => (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    {client.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-300">
                      {client.ratio}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {client.days.map(d => (
                        <span key={d} className="inline-flex items-center rounded-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:text-blue-400">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{client.keyWorker}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold ${
                      client.status === 'Active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  User,
  Filter,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Activity,
  Tag,
  PlusCircle,
} from "lucide-react";
import {
  useStore,
  Client,
  ClientRisk,
  ClientGoal,
  JournalNote,
} from "@/store/useStore";

export function Clients() {
  const { user, clients, notes } = useStore();
  const isManager = user?.role === "Admin" || user?.role === "Coordinator";

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const clientNotes = selectedClient
    ? notes
        .filter((n) => n.clientIds.includes(selectedClient.id))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    : [];

  if (selectedClient) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-12">
        <Button
          variant="ghost"
          onClick={() => setSelectedClientId(null)}
          className="gap-2 -ml-3 text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {selectedClient.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Age: {selectedClient.age || "N/A"} • Support Level:{" "}
                {selectedClient.supportLevel || "Standard"}
              </p>
            </div>
          </div>
          {isManager && (
            <Button variant="outline" className="gap-2">
              Edit Profile
            </Button>
          )}
        </div>

        {/* Risk Assessment Section */}
        <Card className="border-red-100 dark:border-red-900/30 overflow-hidden shadow-sm">
          <CardHeader className="bg-red-50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/30 flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-lg">
                Risk Assessment & Safety Plan
              </CardTitle>
            </div>
            {isManager && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-red-700 border-red-200 hover:bg-red-100"
              >
                <PlusCircle className="w-4 h-4" /> Add Risk
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {selectedClient.risks && selectedClient.risks.length > 0 ? (
              <div className="flex flex-col divide-y">
                {selectedClient.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start"
                  >
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block mb-1">
                        {risk.category}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {risk.hazard}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                          risk.level === "Extreme"
                            ? "bg-red-600 text-white"
                            : risk.level === "High"
                              ? "bg-orange-500 text-white"
                              : risk.level === "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {risk.level} Risk
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block mb-1">
                        Mitigation / Support Needs
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {risk.mitigation}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-2">
                        Last Reviewed: {risk.lastReviewed} • Next Due:{" "}
                        {risk.nextReview}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                No active risks recorded for this client.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed: Notes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold tracking-tight mt-4">
              Progress Notes & Documentation
            </h2>

            {clientNotes.length > 0 ? (
              <div className="space-y-4">
                {clientNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="overflow-hidden shadow-sm border-slate-200"
                  >
                    <CardHeader className="bg-slate-50 border-b py-3 px-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-slate-500 mb-1">
                            {note.noteType}
                          </div>
                          <h3 className="font-bold text-slate-900">
                            {note.subject}
                          </h3>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          {new Date(note.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-sm text-slate-700 whitespace-pre-wrap">
                      {note.content}

                      {note.noteType === "Activity / Session Note" &&
                        note.barriers && (
                          <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mt-4 text-xs space-y-2">
                            <h4 className="font-bold text-amber-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Barriers &
                              Facilitation
                            </h4>
                            {note.barriers.physical && (
                              <div>
                                <span className="font-semibold">Physical:</span>{" "}
                                {note.barriers.physical}
                              </div>
                            )}
                            {note.barriers.sensory && (
                              <div>
                                <span className="font-semibold">Sensory:</span>{" "}
                                {note.barriers.sensory}
                              </div>
                            )}
                            {note.barriers.strategies && (
                              <div>
                                <span className="font-semibold">
                                  Strategies:
                                </span>{" "}
                                {note.barriers.strategies}
                              </div>
                            )}
                          </div>
                        )}

                      {note.linkedGoalIds && note.linkedGoalIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                          {note.linkedGoalIds.map((gid) => {
                            const goal = selectedClient.goals?.find(
                              (g) => g.id === gid,
                            );
                            if (!goal) return null;
                            return (
                              <span
                                key={gid}
                                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium border border-emerald-100"
                              >
                                <Tag className="w-3 h-3" /> Linked to Goal:{" "}
                                {goal.title}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center text-slate-500 border-dashed border-2 shadow-sm">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                No notes found for this client.
              </Card>
            )}
          </div>

          {/* Sidebar: Goals */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight mt-4">
              NDIS Goals
            </h2>
            {selectedClient.goals && selectedClient.goals.length > 0 ? (
              <div className="space-y-3">
                {selectedClient.goals.map((goal) => (
                  <Card key={goal.id} className="shadow-sm border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${goal.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                        >
                          {goal.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {goal.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-500 text-sm shadow-sm">
                No active outcomes or goals recorded.
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage client profiles, risk assessments, and documentation.
          </p>
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
          <Input
            className="pl-8"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Support Level</th>
                <th className="px-6 py-4 font-medium">Active Risks</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {filteredClients.map((client) => {
                const highExtremeRisks = (client.risks || []).filter(
                  (r) => r.level === "Extreme" || r.level === "High",
                ).length;

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      {client.name}
                    </td>
                    <td className="px-6 py-4">
                      {client.supportLevel || "Standard"}
                    </td>
                    <td className="px-6 py-4">
                      {highExtremeRisks > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-100 dark:bg-red-900/40 px-2 py-1 text-xs font-semibold text-red-800 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />{" "}
                          {highExtremeRisks} High/Extreme
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClientId(client.id);
                        }}
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No clients found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

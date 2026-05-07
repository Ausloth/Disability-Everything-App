import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { Plus, Grid, Trash2, Edit2, Lock, FileBox } from "lucide-react";

export function CommunicationBoards() {
  const { user, commBoards, addCommBoard, deleteCommBoard } = useStore();
  const isManager = user?.role === "Admin" || user?.role === "Coordinator";

  // Filter boards
  const siteTemplates = commBoards.filter((b) => b.isCommon);
  const clientBoards = commBoards.filter((b) => !b.isCommon);

  const handleCreateBoard = () => {
    const newBoard = {
      id: crypto.randomUUID(),
      title: "New Comm Board",
      isCommon: isManager,
      creatorRole: user?.role || "SupportWorker",
      rows: 4,
      cols: 4,
      cells: Array(16)
        .fill({ text: "", image: "", bgColor: "#ffffff", textColor: "#000000" })
        .map((c, i) => ({ ...c, id: i })),
    };
    addCommBoard(newBoard);
    // Needs a way to navigate to the builder...
    // In a real app we'd use react-router-dom navigate
    window.location.hash = `#/comm-boards/builder/${newBoard.id}`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Communication Boards
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage AAC (Augmentative and Alternative Communication)
            boards for clients.
          </p>
        </div>
        <Button onClick={handleCreateBoard} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          {isManager ? "New Site Template" : "New Client Board"}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Site-Wide Templates */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            Site-Wide Templates
            <span className="text-xs font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
              Common Use
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {siteTemplates.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                canEdit={isManager}
                onDelete={() => deleteCommBoard(board.id)}
              />
            ))}
            {siteTemplates.length === 0 && (
              <div className="col-span-full p-8 border border-dashed rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                No site-wide templates created yet.
              </div>
            )}
          </div>
        </div>

        {/* Client Specific Boards */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Grid className="w-5 h-5 text-emerald-500" />
            Client & Custom Boards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clientBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                canEdit={true} // Staff can edit these
                onDelete={() => deleteCommBoard(board.id)}
              />
            ))}
            {clientBoards.length === 0 && (
              <div className="col-span-full p-8 text-center border border-dashed rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-2">
                <FileBox className="w-8 h-8 opacity-20" />
                <p>No custom client boards created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  board,
  canEdit,
  onDelete,
}: {
  board: any;
  canEdit: boolean;
  onDelete: () => void;
}) {
  return (
    <Card className="hover:border-blue-300 transition-colors group overflow-hidden flex flex-col">
      <div className="bg-slate-100 dark:bg-slate-800 p-4 shrink-0 border-b flex justify-center items-center h-32 text-slate-400">
        <Grid className="w-12 h-12 opacity-20" />
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-1">{board.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {board.cols} x {board.rows} Grid
        </p>

        <div className="mt-auto flex items-center gap-2">
          <Button
            variant="default"
            className="flex-1 w-full gap-2"
            onClick={() =>
              (window.location.hash = `#/comm-boards/builder/${board.id}`)
            }
          >
            {canEdit ? (
              <Edit2 className="w-4 h-4" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
            {canEdit ? "Edit & Use" : "Use Board"}
          </Button>
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

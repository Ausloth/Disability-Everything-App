import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit2,
  Volume2,
  Save,
  X,
  Search,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BoardBuilder() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { commBoards, updateCommBoard } = useStore();

  const board = commBoards.find((b) => b.id === boardId);

  const [mode, setMode] = useState<"edit" | "use">("edit");
  const [activeCellId, setActiveCellId] = useState<number | null>(null);

  const [localBoard, setLocalBoard] = useState(
    board || {
      id: "",
      title: "",
      cols: 4,
      rows: 4,
      cells: [],
      isCommon: false,
    },
  );

  useEffect(() => {
    if (board) {
      setLocalBoard(board);
    }
  }, [board]);

  const saveBoard = () => {
    updateCommBoard(localBoard.id, localBoard);
  };

  const handleCellClick = (cellId: number) => {
    if (mode === "edit") {
      setActiveCellId(cellId);
    } else {
      // Use mode - speak text
      const cell = localBoard.cells.find((c: any) => c.id === cellId);
      if (cell && cell.text) {
        speakText(cell.text);
      }
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateCell = (cellId: number, updates: any) => {
    setLocalBoard((prev) => ({
      ...prev,
      cells: prev.cells.map((c) =>
        c.id === cellId ? { ...c, ...updates } : c,
      ),
    }));
  };

  if (!board) return <div className="p-8">Board not found.</div>;

  // Create grid mapping
  const gridTemplateColumns = `repeat(${localBoard.cols}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/comm-boards")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <input
              type="text"
              value={localBoard.title}
              disabled={
                mode === "use" ||
                (board.isCommon &&
                  useStore.getState().user?.role === "SupportWorker")
              }
              onChange={(e) =>
                setLocalBoard({ ...localBoard, title: e.target.value })
              }
              className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
            />
            {localBoard.isCommon && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Site Template
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2",
                mode === "edit"
                  ? "bg-white dark:bg-slate-700 shadow text-blue-600"
                  : "text-slate-500",
              )}
              onClick={() => setMode("edit")}
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2",
                mode === "use"
                  ? "bg-white dark:bg-slate-700 shadow text-emerald-600"
                  : "text-slate-500",
              )}
              onClick={() => setMode("use")}
            >
              <Volume2 className="w-4 h-4" /> Use
            </button>
          </div>

          {mode === "edit" && (
            <Button
              onClick={saveBoard}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" /> Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Main Board Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl border overflow-auto p-4 flex flex-col sm:p-8 relative">
          <div className="m-auto w-full max-w-5xl">
            <div
              className="grid gap-2 sm:gap-3 w-full"
              style={{ gridTemplateColumns }}
            >
              {localBoard.cells.map((cell) => (
                <div
                  key={cell.id}
                  onClick={() => handleCellClick(cell.id)}
                  style={{
                    backgroundColor: cell.bgColor,
                    color: cell.textColor,
                  }}
                  className={cn(
                    "aspect-square sm:aspect-[4/3] rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all overflow-hidden",
                    mode === "use"
                      ? "hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                      : "hover:border-blue-400 border-transparent shadow",
                  )}
                >
                  {cell.image ? (
                    <img
                      src={cell.image}
                      alt={cell.text}
                      className="w-1/2 h-1/2 sm:w-2/3 sm:h-2/3 object-contain mb-1 pointer-events-none"
                    />
                  ) : (
                    <div className="w-1/2 h-1/2 sm:w-2/3 sm:h-2/3 flex items-center justify-center mb-1 text-4xl opacity-20">
                      <ImageIcon />
                    </div>
                  )}
                  <span className="font-bold text-center text-[10px] sm:text-xs md:text-sm uppercase tracking-wide px-1 truncate w-full pointer-events-none">
                    {cell.text || (mode === "edit" ? "" : "")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Panel Overlay / Sidebar */}
        {mode === "edit" && activeCellId !== null && (
          <CellEditorModal
            cell={localBoard.cells.find((c) => c.id === activeCellId)}
            onClose={() => setActiveCellId(null)}
            onUpdate={(updates) => updateCell(activeCellId, updates)}
          />
        )}
      </div>
    </div>
  );
}

function CellEditorModal({
  cell,
  onClose,
  onUpdate,
}: {
  cell: any;
  onClose: () => void;
  onUpdate: (updates: any) => void;
}) {
  const [tab, setTab] = useState<"emoji" | "image" | "arasaac">("emoji");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const ARASAAC_SEARCH = async () => {
    if (!searchText) return;
    try {
      const res = await fetch(
        `https://api.arasaac.org/api/pictograms/en/search/${searchText}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(
          data.slice(0, 20).map((item: any) => ({
            url: `https://static.arasaac.org/pictograms/${item._id}/${item._id}_300.png`,
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simplified Emojis for local fallback
  const searchEmojis = () => {
    // Very basic local emoji hack for demo functionality
    const dummyEmojis = [
      "😀",
      "😂",
      "🥰",
      "😎",
      "🤩",
      "🤔",
      "😴",
      "🥶",
      "🤯",
      "🥳",
      "🚗",
      "🏠",
      "🍎",
      "🍔",
      "🏀",
      "⚽",
      "🐶",
      "🐱",
    ];
    setSearchResults(dummyEmojis.map((e) => ({ emoji: e })));
  };

  const PRESET_COLORS = [
    "#ffffff",
    "#dbeafe",
    "#dcfce3",
    "#fef08a",
    "#fee2e2",
    "#f3e8ff",
    "#ffedd5",
  ];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Cell Content</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left: Basics */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Text Label</Label>
              <Input
                value={cell.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="e.g. Yes, Stop, Water"
              />
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded border border-slate-300 shadow-sm"
                    style={{ backgroundColor: c }}
                    onClick={() => onUpdate({ bgColor: c })}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="flex gap-2 items-center">
                {cell.image ? (
                  <div className="relative border rounded p-2 bg-slate-50 w-24 h-24 flex items-center justify-center">
                    <img
                      src={cell.image}
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      onClick={() => onUpdate({ image: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border rounded p-2 bg-slate-50 w-24 h-24 flex items-center justify-center text-slate-400 border-dashed">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Media Picker */}
          <div className="flex flex-col border-l pl-6 min-h-[300px]">
            <div className="flex gap-2 border-b mb-4">
              <button
                onClick={() => setTab("emoji")}
                className={cn(
                  "pb-2 px-1 text-sm font-semibold border-b-2",
                  tab === "emoji"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-slate-500",
                )}
              >
                Emoji
              </button>
              <button
                onClick={() => setTab("arasaac")}
                className={cn(
                  "pb-2 px-1 text-sm font-semibold border-b-2",
                  tab === "arasaac"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500",
                )}
              >
                ARASAAC
              </button>
              <button
                onClick={() => setTab("image")}
                className={cn(
                  "pb-2 px-1 text-sm font-semibold border-b-2",
                  tab === "image"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-slate-500",
                )}
              >
                URL
              </button>
            </div>

            {tab === "arasaac" && (
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex gap-2">
                  <Input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search symbols..."
                    onKeyDown={(e) => e.key === "Enter" && ARASAAC_SEARCH()}
                  />
                  <Button size="icon" onClick={ARASAAC_SEARCH}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-50 rounded border p-2 grid grid-cols-3 gap-2 content-start">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => onUpdate({ image: res.url })}
                      className="border rounded bg-white p-1 cursor-pointer hover:border-blue-500 aspect-square flex flex-col justify-center items-center"
                    >
                      {res.url ? (
                        <img src={res.url} />
                      ) : (
                        <span className="text-3xl">{res.emoji}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "emoji" && (
              <div className="flex flex-col flex-1 gap-2">
                <Button onClick={searchEmojis} variant="secondary">
                  Load Emojis
                </Button>
                <div className="flex-1 overflow-y-auto bg-slate-50 rounded border p-2 grid grid-cols-4 gap-2 content-start">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        // generate a data url for the emoji
                        const canvas = document.createElement("canvas");
                        canvas.width = 128;
                        canvas.height = 128;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                          ctx.font = "96px sans-serif";
                          ctx.textAlign = "center";
                          ctx.textBaseline = "middle";
                          ctx.fillText(res.emoji, 64, 72);
                          onUpdate({ image: canvas.toDataURL() });
                        }
                      }}
                      className="border rounded bg-white p-2 cursor-pointer hover:border-emerald-500 aspect-square flex justify-center items-center text-4xl"
                    >
                      {res.emoji}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "image" && (
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Paste Image URL</Label>
                  <div className="flex gap-2">
                    <Input id="imgUrlInput" placeholder="https://..." />
                    <Button
                      onClick={() => {
                        const v = (
                          document.getElementById(
                            "imgUrlInput",
                          ) as HTMLInputElement
                        ).value;
                        if (v) onUpdate({ image: v });
                      }}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

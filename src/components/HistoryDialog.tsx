import React, { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Trash2, ArrowRight, Clock, FileCode } from "lucide-react"
import { getStoredHistory, SavedDiagram } from "@/lib/storage"
import { toast } from "sonner"

interface HistoryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (code: string, isMarkdown: boolean, title: string) => void
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [history, setHistory] = useState<SavedDiagram[]>([])

  useEffect(() => {
    if (isOpen) {
      setHistory(getStoredHistory())
    }
  }, [isOpen])

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all diagram history?")) {
      localStorage.removeItem("mermaidart_history")
      setHistory([])
      toast.info("History cleared")
    }
  }

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = history.filter((h) => h.id !== id)
    setHistory(updated)
    localStorage.setItem("mermaidart_history", JSON.stringify(updated))
  }

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Recent"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Recent Diagrams</DialogTitle>
                <DialogDescription className="text-xs">
                  Your auto-saved diagrams stored locally in your browser.
                </DialogDescription>
              </div>
            </div>

            {history.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClearAll}
                className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelect(item.code, item.isMarkdown, item.title)
                onClose()
                toast.success(`Restored "${item.title}"`)
              }}
              className="group p-3.5 rounded-xl border border-border/80 hover:border-primary/60 bg-card hover:bg-accent/40 transition-all cursor-pointer flex items-center justify-between space-x-3 shadow-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {item.isMarkdown ? "Markdown" : "Mermaid"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
                  {item.code.split("\n")[0] || "Empty diagram"}
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  title="Delete from history"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <div className="text-primary group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <FileCode className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No saved diagrams in history yet. Your edits are saved automatically as you work.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
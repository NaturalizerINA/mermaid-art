import React, { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Search, 
  LayoutTemplate, 
  ArrowRight,
  Database,
  Layers,
  Calendar,
  PieChart,
  FileText
} from "lucide-react"
import { TEMPLATES } from "@/data/templates"

interface TemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (code: string, isMarkdown?: boolean, title?: string) => void
}

export const TemplateDialog: React.FC<TemplateDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: "All Diagrams", icon: LayoutTemplate },
    { id: "architecture", label: "Architecture & Cloud", icon: Layers },
    { id: "sequence", label: "Sequence & Auth", icon: ArrowRight },
    { id: "database", label: "Database & ERD", icon: Database },
    { id: "project", label: "Project & Roadmap", icon: Calendar },
    { id: "data", label: "Data & Charts", icon: PieChart },
    { id: "markdown", label: "Markdown Document", icon: FileText },
  ]

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesCategory = category === "all" || t.category === category
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Template & Example Gallery</DialogTitle>
              <DialogDescription className="text-xs">
                Choose from pre-built diagrams for architecture, auth flows, databases, and roadmaps.
              </DialogDescription>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates (e.g. sequence, ERD, architecture, git, auth)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2">
            {categories.map((c) => {
              const Icon = c.icon
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-medium shrink-0 flex items-center space-x-1.5 transition-all ${
                    category === c.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              )
            })}
          </div>
        </DialogHeader>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                onSelect(t.code, t.isMarkdown, t.title)
                onClose()
              }}
              className="group p-4 rounded-xl border border-border/80 hover:border-primary/60 bg-card hover:bg-accent/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {t.title}
                  </span>
                  <Badge variant="outline" className="text-[10px] capitalize font-mono">
                    {t.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Code snippet preview */}
              <div className="bg-muted/60 p-2 rounded-lg font-mono text-[10px] text-muted-foreground overflow-hidden max-h-16 border border-border/40 line-clamp-3">
                {t.code.trim().split("\n").slice(0, 4).join("\n")}
              </div>

              <div className="flex items-center justify-end text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p className="text-sm">No templates matched your search criteria.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
import React from "react"
import { 
  Sparkles, 
  Download, 
  Copy, 
  Share2, 
  History, 
  LayoutTemplate, 
  Sun, 
  Moon, 
  Code2, 
  FileText,
  Check,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TEMPLATES } from "@/data/templates"
import { LogoIcon } from "@/components/LogoIcon"

interface NavbarProps {
  isMarkdown: boolean
  setIsMarkdown: (val: boolean) => void
  onSelectTemplate: (code: string, isMd?: boolean, title?: string) => void
  onOpenTemplatesModal: () => void
  onOpenExportModal: () => void
  onOpenHistoryModal: () => void
  onQuickCopyImage: () => void
  onShareLink: () => void
  isDark: boolean
  toggleTheme: () => void
  copying: boolean
  isEditorCollapsed: boolean
  toggleEditorCollapse: () => void
  setEditorWidthPercent: (percent: number) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  isMarkdown,
  setIsMarkdown,
  onSelectTemplate,
  onOpenTemplatesModal,
  onOpenExportModal,
  onOpenHistoryModal,
  onQuickCopyImage,
  onShareLink,
  isDark,
  toggleTheme,
  copying,
  isEditorCollapsed,
  toggleEditorCollapse,
  setEditorWidthPercent,
}) => {
  return (
    <header className="h-14 border-b bg-card/70 backdrop-blur-md px-4 flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Left Actions */}
      <div className="flex items-center space-x-3">
        {/* Toggle Editor Collapse */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleEditorCollapse}
          className="h-8 w-8 text-foreground hover:bg-accent"
          title={isEditorCollapsed ? "Show Code Editor" : "Hide Editor (Full Canvas to Right)"}
        >
          {isEditorCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-primary" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>

        <div className="flex items-center space-x-2.5">
          <LogoIcon size={32} className="shadow-md shadow-blue-500/20 rounded-lg shrink-0" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm tracking-tight text-foreground">MermaidArt</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                PRO Studio
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

        {/* Mode Switcher */}
        <div className="hidden sm:flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 text-xs">
          <button
            onClick={() => setIsMarkdown(false)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              !isMarkdown
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mermaid Mode</span>
          </button>
          <button
            onClick={() => setIsMarkdown(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              isMarkdown
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Center Actions / Quick Template Picker */}
      <div className="hidden md:flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs font-normal gap-1.5 bg-background/50">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Quick Templates</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64 max-h-[350px] overflow-y-auto">
            <DropdownMenuLabel className="text-xs font-semibold">Popular Diagram Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {TEMPLATES.map((tmpl) => (
              <DropdownMenuItem
                key={tmpl.id}
                onClick={() => onSelectTemplate(tmpl.code, tmpl.isMarkdown, tmpl.title)}
                className="text-xs flex flex-col items-start py-1.5 cursor-pointer"
              >
                <div className="font-medium text-foreground">{tmpl.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">{tmpl.description}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenTemplatesModal}
          className="h-8 text-xs gap-1.5"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
          <span>Gallery</span>
        </Button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Layout Preset Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hidden xl:flex gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Layout</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-xs">
            <DropdownMenuLabel>Canvas Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setEditorWidthPercent(0) }} className="cursor-pointer">
              Full Canvas (100% Right)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditorWidthPercent(30) }} className="cursor-pointer">
              Wide Canvas (30% Editor / 70% Canvas)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditorWidthPercent(50) }} className="cursor-pointer">
              Split Screen (50% / 50%)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* History */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenHistoryModal}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          title="Recent Diagrams History"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">History</span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onShareLink}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          title="Share diagram link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Share</span>
        </Button>

        {/* Quick Copy Image */}
        <Button
          variant="outline"
          size="sm"
          onClick={onQuickCopyImage}
          disabled={copying}
          className="h-8 text-xs gap-1.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
          title="Copy diagram image directly to clipboard"
        >
          {copying ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">Copy Image</span>
        </Button>

        {/* Export / Download */}
        <Button
          variant="gradient"
          size="sm"
          onClick={onOpenExportModal}
          className="h-8 text-xs gap-1.5 shadow-blue-500/20 font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </Button>
      </div>
    </header>
  )
}
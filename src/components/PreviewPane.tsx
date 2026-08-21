import React, { useRef, useState } from "react"
import { 
  TransformWrapper, 
  TransformComponent, 
  ReactZoomPanPinchRef 
} from "react-zoom-pan-pinch"
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Palette, 
  Grid, 
  Layers, 
  SlidersHorizontal,
  Info,
  Check,
  PanelLeftOpen
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
import { MermaidTheme } from "@/lib/mermaid-renderer"

interface PreviewPaneProps {
  svgContent: string
  hasError: boolean
  errorMessage: string | null
  mermaidTheme: MermaidTheme
  setMermaidTheme: (theme: MermaidTheme) => void
  isMarkdown: boolean
  markdownBlocks: Array<{ index: number; code: string; title?: string }>
  activeBlockIndex: number
  setActiveBlockIndex: (index: number) => void
  isRendering: boolean
  isEditorCollapsed?: boolean
  onToggleEditor?: () => void
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  svgContent,
  hasError,
  errorMessage,
  mermaidTheme,
  setMermaidTheme,
  isMarkdown,
  markdownBlocks,
  activeBlockIndex,
  setActiveBlockIndex,
  isRendering,
  isEditorCollapsed = false,
  onToggleEditor,
}) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [bgStyle, setBgStyle] = useState<"grid" | "solid" | "transparent">("grid")
  const containerRef = useRef<HTMLDivElement>(null)

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable full-screen mode:", err)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const themes: { id: MermaidTheme; label: string; color: string }[] = [
    { id: "dark", label: "Dark (Slate)", color: "#0f172a" },
    { id: "default", label: "Default (Light)", color: "#3b82f6" },
    { id: "neutral", label: "Neutral (Monochrome)", color: "#64748b" },
    { id: "forest", label: "Forest (Green)", color: "#10b981" },
    { id: "base", label: "Base (Custom)", color: "#8b5cf6" },
  ]

  const getBackgroundClass = () => {
    switch (bgStyle) {
      case "grid":
        return "bg-grid-pattern bg-background"
      case "transparent":
        return "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-background"
      case "solid":
      default:
        return "bg-background"
    }
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col bg-background relative overflow-hidden ${
        isFullscreen ? "p-4" : ""
      }`}
    >
      {/* Preview Header Bar */}
      <div className="h-11 px-3 border-b bg-card/60 flex items-center justify-between select-none z-10 shrink-0">
        <div className="flex items-center space-x-2">
          {/* Show Editor Toggle button if collapsed */}
          {isEditorCollapsed && onToggleEditor && (
            <Button
              variant="outline"
              size="xs"
              onClick={onToggleEditor}
              className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 mr-1"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
              <span>Show Editor</span>
            </Button>
          )}

          <div className="flex items-center space-x-1.5 font-medium text-xs text-foreground">
            <Eye className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Live Preview</span>
          </div>

          {/* Loading indicator */}
          {isRendering && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 animate-pulse">
              <span>Rendering...</span>
            </Badge>
          )}
        </div>

        {/* Top Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Mermaid Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="xs" className="h-7 text-xs gap-1.5 bg-background/50">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span className="capitalize hidden sm:inline">{mermaidTheme} Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Diagram Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setMermaidTheme(t.id)}
                  className="text-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.label}</span>
                  </div>
                  {mermaidTheme === t.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Canvas Background selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Grid className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Canvas Background</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setBgStyle("grid")} className="text-xs cursor-pointer">
                Dot Grid Pattern
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBgStyle("solid")} className="text-xs cursor-pointer">
                Solid Canvas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setBgStyle("transparent")} className="text-xs cursor-pointer">
                Transparent Grid
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Markdown Multiple Diagrams Tab Bar */}
      {isMarkdown && markdownBlocks.length > 0 && (
        <div className="h-9 px-3 border-b bg-muted/40 flex items-center space-x-1.5 overflow-x-auto no-scrollbar select-none z-10 shrink-0">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mr-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-medium">Found {markdownBlocks.length} diagrams:</span>
          </div>
          {markdownBlocks.map((block) => (
            <button
              key={block.index}
              onClick={() => setActiveBlockIndex(block.index)}
              className={`h-6 px-2.5 rounded text-xs font-medium transition-all ${
                activeBlockIndex === block.index
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-background/70 text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              {block.title || `Diagram #${block.index + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Canvas - Stretches full to the right */}
      <div className={`flex-1 w-full h-full relative overflow-hidden ${getBackgroundClass()}`}>
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card/95 backdrop-blur-md p-6 rounded-2xl border border-destructive/30 shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Diagram Rendering Error</h3>
              <p className="text-xs text-muted-foreground">
                Please check the syntax in the code editor on the left.
              </p>
              {errorMessage && (
                <div className="p-3 bg-muted rounded-lg text-left text-[11px] font-mono text-destructive max-h-36 overflow-y-auto leading-relaxed border border-border/50">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        ) : !svgContent ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <div className="space-y-2 text-muted-foreground max-w-xs">
              <Info className="w-8 h-8 mx-auto opacity-40 text-primary" />
              <p className="text-xs">Type Mermaid diagram syntax on the left or select a template above to preview.</p>
            </div>
          </div>
        ) : (
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Floating Canvas Controls Dock */}
                <div className="absolute bottom-4 right-4 z-20 flex items-center bg-card/85 backdrop-blur-md p-1 rounded-xl border shadow-xl space-x-1 select-none">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomIn(0.2)}
                    title="Zoom In (Wheel Up)"
                    className="h-8 w-8 text-foreground hover:bg-accent"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => zoomOut(0.2)}
                    title="Zoom Out (Wheel Down)"
                    className="h-8 w-8 text-foreground hover:bg-accent"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <div className="h-4 w-px bg-border my-auto" />
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => resetTransform()}
                    title="Reset Zoom & Pan (1:1)"
                    className="h-8 px-2 text-xs font-mono text-foreground hover:bg-accent gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </Button>
                </div>

                <TransformComponent
                  wrapperClass="w-full !h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                  contentClass="w-full !h-full flex items-center justify-center p-8 min-w-full min-h-full"
                >
                  <div
                    id="mermaid-svg-container"
                    className="flex items-center justify-center transition-opacity duration-200 select-none [&>svg]:max-w-full [&>svg]:h-auto drop-shadow-sm"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  )
}
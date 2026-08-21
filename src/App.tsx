import React, { useState, useEffect, useRef, useCallback } from "react"
import { Toaster, toast } from "sonner"
import { Navbar } from "@/components/Navbar"
import { EditorPane } from "@/components/EditorPane"
import { PreviewPane } from "@/components/PreviewPane"
import { ExportModal } from "@/components/ExportModal"
import { TemplateDialog } from "@/components/TemplateDialog"
import { HistoryDialog } from "@/components/HistoryDialog"
import { TEMPLATES } from "@/data/templates"
import { 
  renderMermaid, 
  extractMermaidBlocksFromMarkdown, 
  MermaidTheme 
} from "@/lib/mermaid-renderer"
import { 
  getStoredCurrentCode, 
  getStoredIsMarkdown, 
  saveCurrentCode, 
  addToHistory, 
  generateShareUrl 
} from "@/lib/storage"
import { copyImageToClipboard } from "@/lib/export-engine"

const DEFAULT_CODE = TEMPLATES[0].code

export function App() {
  const [code, setCode] = useState<string>(() => getStoredCurrentCode(DEFAULT_CODE))
  const [isMarkdown, setIsMarkdown] = useState<boolean>(() => getStoredIsMarkdown())
  const [mermaidTheme, setMermaidTheme] = useState<MermaidTheme>("dark")
  const [isDark, setIsDark] = useState<boolean>(true)

  // Layout & Split States
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(() => {
    const saved = localStorage.getItem("mermaidart_editor_width")
    return saved ? parseFloat(saved) : 38
  })
  const [isEditorCollapsed, setIsEditorCollapsed] = useState<boolean>(false)
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false)

  // Render & Error States
  const [svgContent, setSvgContent] = useState<string>("")
  const [hasError, setHasError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState<boolean>(false)

  // Markdown Mode State
  const [markdownBlocks, setMarkdownBlocks] = useState<Array<{ index: number; code: string; title?: string }>>([])
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0)

  // Modal Dialogs
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [copying, setCopying] = useState(false)

  // Debounce refs
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const splitContainerRef = useRef<HTMLDivElement>(null)

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      return next
    })
  }

  // Synchronize dark class on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // Extract diagram code depending on mode
  const getEffectiveMermaidCode = useCallback((): string => {
    if (!isMarkdown) {
      return code
    }

    const blocks = extractMermaidBlocksFromMarkdown(code)
    setMarkdownBlocks(blocks)

    if (blocks.length === 0) {
      return ""
    }

    const currentBlock = blocks[activeBlockIndex] || blocks[0]
    return currentBlock.code
  }, [code, isMarkdown, activeBlockIndex])

  // Perform Mermaid Rendering
  const triggerRender = useCallback(async () => {
    const mermaidCode = getEffectiveMermaidCode()

    if (!mermaidCode.trim()) {
      if (isMarkdown && markdownBlocks.length === 0) {
        setHasError(true)
        setErrorMessage("No ```mermaid code blocks found in markdown document.")
      } else {
        setSvgContent("")
        setHasError(false)
        setErrorMessage(null)
      }
      return
    }

    setIsRendering(true)
    const res = await renderMermaid(mermaidCode, mermaidTheme)
    setIsRendering(false)

    if (res.error) {
      setHasError(true)
      setErrorMessage(res.error)
    } else {
      setSvgContent(res.svg)
      setHasError(false)
      setErrorMessage(null)
    }
  }, [getEffectiveMermaidCode, mermaidTheme, isMarkdown, markdownBlocks.length])

  // Debounced Render on code/theme/mode changes
  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }

    renderTimeoutRef.current = setTimeout(() => {
      triggerRender()
    }, 250)

    return () => {
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current)
    }
  }, [code, mermaidTheme, isMarkdown, activeBlockIndex, triggerRender])

  // Auto-save to LocalStorage & History
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentCode(code, isMarkdown)
      if (code.trim()) {
        const firstLine = code.trim().split("\n")[0].replace(/^[%#]+\s*/, "").slice(0, 40)
        addToHistory(firstLine || "Diagram", code, isMarkdown)
      }
    }, 1500)

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [code, isMarkdown])

  // Resizable Splitter Drag Handler
  const handleMouseDownSplitter = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingSplitter(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter || !splitContainerRef.current) return
      const rect = splitContainerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100
      if (newWidth >= 18 && newWidth <= 75) {
        setEditorWidthPercent(newWidth)
        localStorage.setItem("mermaidart_editor_width", newWidth.toString())
      }
    }

    const handleMouseUp = () => {
      if (isDraggingSplitter) {
        setIsDraggingSplitter(false)
      }
    }

    if (isDraggingSplitter) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingSplitter])

  // Handle template selection
  const handleSelectTemplate = (newCode: string, isMd: boolean = false, title?: string) => {
    setIsMarkdown(isMd)
    setCode(newCode)
    setActiveBlockIndex(0)
    toast.success(`Loaded template: "${title || 'Diagram'}"`)
  }

  // Quick Copy Image
  const handleQuickCopyImage = async () => {
    if (!svgContent) {
      toast.error("No valid diagram to copy")
      return
    }

    setCopying(true)
    try {
      await copyImageToClipboard(svgContent, {
        scale: 2,
        backgroundType: mermaidTheme === "dark" ? "dark" : "white",
        padding: 24,
      })
      toast.success("Diagram PNG copied to clipboard!")
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to copy image to clipboard")
    } finally {
      setTimeout(() => setCopying(false), 800)
    }
  }

  // Share Link
  const handleShareLink = async () => {
    try {
      const shareUrl = generateShareUrl(code)
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Shareable URL link copied to clipboard!")
    } catch (e) {
      toast.error("Failed to copy share link")
    }
  }

  const handleSetEditorWidth = (percent: number) => {
    if (percent === 0) {
      setIsEditorCollapsed(true)
    } else {
      setIsEditorCollapsed(false)
      setEditorWidthPercent(percent)
      localStorage.setItem("mermaidart_editor_width", percent.toString())
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground select-none">
      <Toaster position="bottom-center" richColors />

      {/* Top Navbar */}
      <Navbar
        isMarkdown={isMarkdown}
        setIsMarkdown={setIsMarkdown}
        onSelectTemplate={handleSelectTemplate}
        onOpenTemplatesModal={() => setIsTemplatesOpen(true)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        onQuickCopyImage={handleQuickCopyImage}
        onShareLink={handleShareLink}
        isDark={isDark}
        toggleTheme={toggleTheme}
        copying={copying}
        isEditorCollapsed={isEditorCollapsed}
        toggleEditorCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
        setEditorWidthPercent={handleSetEditorWidth}
      />

      {/* Main Workspace (Editor + Full to Right Canvas) */}
      <div 
        ref={splitContainerRef}
        className={`flex-1 flex flex-col md:flex-row overflow-hidden relative ${
          isDraggingSplitter ? "cursor-col-resize select-none" : ""
        }`}
      >
        {/* Left: Code Editor Pane */}
        {!isEditorCollapsed && (
          <div 
            style={{ width: `${editorWidthPercent}%` }}
            className="hidden md:block h-full overflow-hidden transition-[width] duration-75 shrink-0"
          >
            <EditorPane
              code={code}
              onChange={setCode}
              isMarkdown={isMarkdown}
              hasError={hasError}
              errorMessage={errorMessage}
              isDark={isDark}
              onInsertSnippet={(snip) => setCode((prev) => prev + "\n" + snip)}
            />
          </div>
        )}

        {/* Mobile View: Vertical split */}
        {!isEditorCollapsed && (
          <div className="block md:hidden w-full h-1/2 overflow-hidden shrink-0">
            <EditorPane
              code={code}
              onChange={setCode}
              isMarkdown={isMarkdown}
              hasError={hasError}
              errorMessage={errorMessage}
              isDark={isDark}
              onInsertSnippet={(snip) => setCode((prev) => prev + "\n" + snip)}
            />
          </div>
        )}

        {/* Draggable Divider Splitter */}
        {!isEditorCollapsed && (
          <div
            onMouseDown={handleMouseDownSplitter}
            className="hidden md:flex w-1.5 hover:w-2 hover:bg-primary/50 bg-border/80 transition-all cursor-col-resize items-center justify-center relative group z-20 shrink-0 select-none"
            title="Drag to resize editor & canvas width"
          >
            <div className="h-8 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary" />
          </div>
        )}

        {/* Right: Live Preview Canvas Pane - Stretches 100% full to right */}
        <div className="flex-1 w-full h-full overflow-hidden min-w-0">
          <PreviewPane
            svgContent={svgContent}
            hasError={hasError}
            errorMessage={errorMessage}
            mermaidTheme={mermaidTheme}
            setMermaidTheme={setMermaidTheme}
            isMarkdown={isMarkdown}
            markdownBlocks={markdownBlocks}
            activeBlockIndex={activeBlockIndex}
            setActiveBlockIndex={setActiveBlockIndex}
            isRendering={isRendering}
            isEditorCollapsed={isEditorCollapsed}
            onToggleEditor={() => setIsEditorCollapsed(false)}
          />
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        svgContent={svgContent}
      />

      {/* Templates Gallery Modal */}
      <TemplateDialog
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelect={handleSelectTemplate}
      />

      {/* History Dialog */}
      <HistoryDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={(savedCode, isMd) => {
          setIsMarkdown(isMd)
          setCode(savedCode)
          setActiveBlockIndex(0)
        }}
      />
    </div>
  )
}

export default App
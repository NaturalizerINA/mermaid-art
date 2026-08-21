import React, { useRef, useState } from "react"
import Editor, { OnMount } from "@monaco-editor/react"
import { 
  Copy, 
  Upload, 
  Trash2, 
  FileCode, 
  WrapText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SnippetBar } from "@/components/SnippetBar"
import { toast } from "sonner"

interface EditorPaneProps {
  code: string
  onChange: (value: string) => void
  isMarkdown: boolean
  hasError: boolean
  errorMessage: string | null
  isDark: boolean
  onInsertSnippet: (snippet: string) => void
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  code,
  onChange,
  isMarkdown,
  hasError,
  errorMessage,
  isDark,
  onInsertSnippet,
}) => {
  const editorRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on")
  const [fontSize, setFontSize] = useState<number>(14)
  const [isDragging, setIsDragging] = useState(false)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Custom Mermaid syntax coloring rules
    monaco.languages.register({ id: "mermaid" })
    monaco.languages.setMonarchTokensProvider("mermaid", {
      tokenizer: {
        root: [
          [/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram-v2|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|journey|C4Context|C4Container|C4Component|requirementDiagram)/, "keyword"],
          [/subgraph|end|autonumber|actor|participant|class|classDef|style|click/, "type"],
          [/(-->|-.->|==>|--o|--x|->>|-->>|->|<-)/, "operator"],
          [/".*?"/, "string"],
          [/%%.*/, "comment"],
          [/\[.*?\]|\(.*?\)|{.*?}|\[\(.*?\)\]/, "identifier"],
        ]
      }
    })
  }

  const handleInsert = (snippet: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection()
      const id = { major: 1, minor: 1 }
      const op = {
        identifier: id,
        range: selection,
        text: snippet,
        forceMoveMarkers: true
      }
      editorRef.current.executeEdits("my-source", [op])
      editorRef.current.focus()
    } else {
      onChange(code + "\n" + snippet)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Code copied to clipboard!")
    } catch (e) {
      toast.error("Failed to copy code")
    }
  }

  const handleClearCode = () => {
    if (window.confirm("Are you sure you want to clear the editor?")) {
      onChange("")
      toast.info("Editor cleared")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        onChange(content)
        toast.success(`Loaded "${file.name}"`)
      }
    }
    reader.readAsText(file)
    // reset input
    e.target.value = ""
  }

  const handleDownloadSource = () => {
    const ext = isMarkdown ? "md" : "mmd"
    const filename = `diagram-${Date.now()}.${ext}`
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded source file (${filename})`)
  }

  // Drag & drop file support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (content) {
          onChange(content)
          toast.success(`Loaded "${file.name}"`)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div 
      className={`h-full flex flex-col border-r bg-card/40 relative ${
        isDragging ? "ring-2 ring-primary ring-inset bg-primary/5" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Editor Header Bar */}
      <div className="h-11 px-3 border-b bg-card/60 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-medium text-xs text-foreground">
            <FileCode className="w-3.5 h-3.5 text-blue-500" />
            <span>{isMarkdown ? "Markdown Source" : "Mermaid Code"}</span>
          </div>

          {/* Validation Status */}
          {hasError ? (
            <Badge variant="destructive" className="text-[10px] h-5 gap-1 px-1.5">
              <AlertCircle className="w-3 h-3" />
              <span>Syntax Error</span>
            </Badge>
          ) : (
            <Badge variant="success" className="text-[10px] h-5 gap-1 px-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Valid Syntax</span>
            </Badge>
          )}
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center space-x-1">
          {/* Font Size */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setFontSize(fontSize === 16 ? 12 : fontSize + 2)}
            title={`Font size: ${fontSize}px (click to toggle)`}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{fontSize}px</span>
          </Button>

          {/* Word Wrap */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
            title={`Word wrap: ${wordWrap}`}
            className={`h-7 w-7 ${wordWrap === "on" ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </Button>

          {/* Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".mmd,.md,.txt"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Import .mmd, .md, or .txt file"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Upload className="w-3.5 h-3.5" />
          </Button>

          {/* Download Source */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadSource}
            title="Download source code"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>

          {/* Copy Code */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyCode}
            title="Copy code to clipboard"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          {/* Clear */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearCode}
            title="Clear editor"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Snippets Bar (shown in Mermaid mode) */}
      {!isMarkdown && <SnippetBar onInsertSnippet={handleInsert} />}

      {/* Monaco Code Editor */}
      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          language={isMarkdown ? "markdown" : "mermaid"}
          value={code}
          theme={isDark ? "vs-dark" : "light"}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', monospace",
            fontLigatures: true,
            tabSize: 2,
            minimap: { enabled: false },
            wordWrap: wordWrap,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbers: "on",
            renderLineHighlight: "all",
            overviewRulerBorder: false,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
          }}
        />

        {/* Drag overlay notice */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-xs flex items-center justify-center pointer-events-none border-2 border-dashed border-primary z-50">
            <div className="bg-card shadow-lg p-4 rounded-xl text-center flex flex-col items-center space-y-2 border">
              <Upload className="w-8 h-8 text-primary animate-bounce" />
              <p className="font-semibold text-sm text-foreground">Drop your .mmd or .md file here</p>
              <p className="text-xs text-muted-foreground">The file content will be loaded into the editor</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Footer if any */}
      {hasError && errorMessage && (
        <div className="p-2.5 bg-destructive/10 border-t border-destructive/20 text-xs text-destructive flex items-start space-x-2 max-h-24 overflow-y-auto">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-mono text-[11px] leading-relaxed break-all">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Status & Copyright Footer */}
      <div className="h-7 px-3 border-t bg-card/60 flex items-center justify-between text-[11px] text-muted-foreground select-none shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Ready</span>
        </div>
        <div className="text-[10px] text-muted-foreground/80 font-medium">
          © 2026 Rahmad Setiawan Mukminullah
        </div>
      </div>
    </div>
  )
}
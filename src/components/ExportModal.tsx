import React, { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Copy, 
  Check, 
  Maximize, 
  Palette
} from "lucide-react"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { 
  ExportFormat, 
  ExportScale, 
  BackgroundType, 
  exportDiagram, 
  downloadFile, 
  copyImageToClipboard 
} from "@/lib/export-engine"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  svgContent: string
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  svgContent,
}) => {
  const [format, setFormat] = useState<ExportFormat>("png")
  const [scale, setScale] = useState<ExportScale>(2)
  const [bgType, setBgType] = useState<BackgroundType>("transparent")
  const [customBgColor, setCustomBgColor] = useState<string>("#0f172a")
  const [padding, setPadding] = useState<number>(24)
  const [filename, setFilename] = useState<string>("my-diagram")
  const [isExporting, setIsExporting] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  const handleDownload = async () => {
    if (!svgContent) {
      toast.error("No diagram to export")
      return
    }

    setIsExporting(true)
    try {
      const blob = await exportDiagram(svgContent, {
        format,
        scale,
        backgroundType: bgType,
        customBackgroundColor: customBgColor,
        padding,
      })

      const ext = format
      const fullFilename = `${filename.trim() || "diagram"}.${ext}`
      downloadFile(blob, fullFilename)

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
      })

      toast.success(`Successfully exported ${fullFilename}!`)
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || "Failed to export diagram")
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyClipboard = async () => {
    if (!svgContent) return

    setIsCopying(true)
    try {
      if (format === "svg") {
        await navigator.clipboard.writeText(svgContent)
        toast.success("SVG XML code copied to clipboard!")
      } else {
        await copyImageToClipboard(svgContent, {
          scale,
          backgroundType: bgType === "transparent" ? "white" : bgType,
          customBackgroundColor: customBgColor,
          padding,
        })
        toast.success("PNG Image copied to clipboard! You can paste directly (Ctrl+V / Cmd+V).")
      }
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to copy image to clipboard")
    } finally {
      setIsCopying(false)
    }
  }

  const formatOptions: { id: ExportFormat; label: string; desc: string }[] = [
    { id: "png", label: "PNG", desc: "High resolution with transparent background support" },
    { id: "svg", label: "SVG", desc: "Infinite vector clarity, perfect for Figma/Illustrator" },
    { id: "jpeg", label: "JPEG", desc: "Standard compressed image with solid background" },
    { id: "webp", label: "WebP", desc: "Modern lightweight web image format" },
  ]

  const bgOptions: { id: BackgroundType; label: string; preview: string }[] = [
    { id: "transparent", label: "Transparent", preview: "border-dashed border-2 bg-transparent" },
    { id: "white", label: "Pure White", preview: "bg-white border text-black" },
    { id: "dark", label: "Dark Slate", preview: "bg-slate-900 border text-white" },
    { id: "custom", label: "Custom", preview: "bg-gradient-to-tr from-purple-600 to-pink-600 text-white" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Export Diagram as Image</DialogTitle>
              <DialogDescription className="text-xs">
                Download high-resolution image or copy directly to clipboard.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Export Format</span>
              <Badge variant="outline" className="text-[10px] uppercase">{format}</Badge>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                    format === opt.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                      : "border-border/70 hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase">{opt.label}</span>
                    {format === opt.id && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale Resolution (For raster formats) */}
          {format !== "svg" && (
            <div className="space-y-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Maximize className="w-3.5 h-3.5 text-primary" />
                  Resolution Scale
                </span>
                <span className="font-mono text-primary font-bold text-xs">
                  {scale}x ({scale === 1 ? "Standard" : scale === 2 ? "2x Retina" : scale === 3 ? "3x Print" : "4x Ultra HD"})
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {([1, 2, 3, 4] as ExportScale[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      scale === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent border-border"
                    }`}
                  >
                    {s}x Scale
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background Settings */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                Background Color
              </span>
              <span className="text-[11px] text-muted-foreground capitalize">{bgType}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {bgOptions.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBgType(b.id)}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs transition-all ${
                    bgType === b.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                      : "border-border/70 hover:border-primary/50 bg-card"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-md shrink-0 ${b.preview}`} />
                  <span className="font-medium text-xs truncate">{b.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            {bgType === "custom" && (
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  placeholder="#0f172a"
                  className="h-9 px-3 rounded-lg border bg-background text-xs font-mono w-32"
                />
              </div>
            )}
          </div>

          {/* Padding & Filename */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">File Name</label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="my-diagram"
                  className="h-9 w-full px-3 rounded-lg border bg-background text-xs"
                />
                <span className="text-xs text-muted-foreground font-mono">.{format}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Padding</span>
                <span className="text-muted-foreground font-mono">{padding}px</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[8, 16, 24, 40].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPadding(p)}
                    className={`h-9 rounded-lg text-xs font-medium border transition-all ${
                      padding === p
                        ? "bg-secondary text-foreground border-foreground/30 font-semibold"
                        : "bg-background hover:bg-accent border-border"
                    }`}
                  >
                    {p}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
          <Button
            variant="outline"
            onClick={handleCopyClipboard}
            disabled={isCopying || isExporting}
            className="text-xs gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{format === "svg" ? "Copy SVG Code" : "Copy PNG to Clipboard"}</span>
          </Button>

          <Button
            variant="gradient"
            onClick={handleDownload}
            disabled={isExporting}
            className="text-xs gap-1.5 shadow-blue-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Rendering Image..." : `Download .${format.toUpperCase()}`}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
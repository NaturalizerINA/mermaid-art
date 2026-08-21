export type ExportFormat = "png" | "svg" | "jpeg" | "webp"
export type ExportScale = 1 | 2 | 3 | 4
export type BackgroundType = "transparent" | "white" | "dark" | "custom"

export interface ExportOptions {
  format: ExportFormat
  scale: ExportScale
  backgroundType: BackgroundType
  customBackgroundColor?: string
  padding?: number
  filename?: string
}

/**
 * Prepares and normalizes SVG element or raw SVG string for rendering/export
 */
export function sanitizeSvgForExport(svgString: string): {
  cleanSvg: string
  width: number
  height: number
} {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const svgEl = doc.querySelector("svg")

  if (!svgEl) {
    throw new Error("Invalid SVG content")
  }

  // Ensure xmlns is present
  if (!svgEl.getAttribute("xmlns")) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  }
  if (!svgEl.getAttribute("xmlns:xlink")) {
    svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")
  }

  // Extract dimensions
  let width = 800
  let height = 600

  const viewBox = svgEl.getAttribute("viewBox")
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = parts[2]
      height = parts[3]
    }
  } else {
    const wAttr = parseFloat(svgEl.getAttribute("width") || "0")
    const hAttr = parseFloat(svgEl.getAttribute("height") || "0")
    if (wAttr > 0 && hAttr > 0) {
      width = wAttr
      height = hAttr
    }
  }

  // Remove max-width styles that might constrain rendering
  if (svgEl.style) {
    svgEl.style.maxWidth = ""
  }
  svgEl.setAttribute("width", `${width}`)
  svgEl.setAttribute("height", `${height}`)

  const serializer = new XMLSerializer()
  const cleanSvg = serializer.serializeToString(svgEl)

  return { cleanSvg, width, height }
}

/**
 * Converts SVG to an HTML5 Canvas with custom scaling, background, and padding
 */
export async function svgToCanvas(
  svgString: string,
  options: {
    scale?: number
    backgroundColor?: string | null
    padding?: number
  } = {}
): Promise<HTMLCanvasElement> {
  const { scale = 2, backgroundColor = null, padding = 32 } = options
  const { cleanSvg, width, height } = sanitizeSvgForExport(svgString)

  const totalWidth = (width + padding * 2) * scale
  const totalHeight = (height + padding * 2) * scale

  const canvas = document.createElement("canvas")
  canvas.width = totalWidth
  canvas.height = totalHeight

  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) {
    throw new Error("Could not create 2D canvas context")
  }

  // Draw background if specified
  if (backgroundColor && backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, totalWidth, totalHeight)
  }

  // Convert SVG string to base64 data URL
  const encodedSvg = unescape(encodeURIComponent(cleanSvg))
  const dataUrl = `data:image/svg+xml;base64,${btoa(encodedSvg)}`

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(
        img,
        padding * scale,
        padding * scale,
        width * scale,
        height * scale
      )
      resolve(canvas)
    }
    img.onerror = (err) => {
      reject(new Error("Failed to load SVG into canvas for rasterization"))
    }
    img.src = dataUrl
  })
}

/**
 * Resolves color code based on background options
 */
export function getBackgroundColor(
  type: BackgroundType,
  customColor: string = "#0f172a"
): string | null {
  switch (type) {
    case "transparent":
      return null
    case "white":
      return "#ffffff"
    case "dark":
      return "#0f172a"
    case "custom":
      return customColor
    default:
      return null
  }
}

/**
 * Exports the diagram to Blob or downloads it directly
 */
export async function exportDiagram(
  svgString: string,
  options: ExportOptions
): Promise<Blob> {
  const {
    format,
    scale,
    backgroundType,
    customBackgroundColor,
    padding = 24,
  } = options

  const bg = getBackgroundColor(backgroundType, customBackgroundColor)

  if (format === "svg") {
    const { cleanSvg } = sanitizeSvgForExport(svgString)
    return new Blob([cleanSvg], { type: "image/svg+xml;charset=utf-8" })
  }

  // Raster formats: PNG, JPEG, WEBP
  const canvas = await svgToCanvas(svgString, {
    scale,
    backgroundColor: format === "jpeg" ? bg || "#ffffff" : bg,
    padding,
  })

  return new Promise((resolve, reject) => {
    const mimeType =
      format === "jpeg"
        ? "image/jpeg"
        : format === "webp"
        ? "image/webp"
        : "image/png"

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error(`Failed to convert canvas to ${format}`))
        }
      },
      mimeType,
      0.95
    )
  })
}

/**
 * Downloads a Blob directly to the user's filesystem
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Copies a PNG image Blob to the user's OS clipboard
 */
export async function copyImageToClipboard(
  svgString: string,
  options: Partial<ExportOptions> = {}
): Promise<void> {
  const bg = getBackgroundColor(
    options.backgroundType || "white",
    options.customBackgroundColor
  )

  const canvas = await svgToCanvas(svgString, {
    scale: options.scale || 2,
    backgroundColor: bg || "#ffffff",
    padding: options.padding || 20,
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Could not create image blob"))
        return
      }

      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ "image/png": blob })
          await navigator.clipboard.write([item])
          resolve()
        } else {
          reject(new Error("Clipboard API not supported on this browser"))
        }
      } catch (err) {
        reject(err)
      }
    }, "image/png")
  })
}
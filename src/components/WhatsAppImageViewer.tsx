"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface WhatsAppImageViewerProps {
  src: string
  alt?: string
  caption?: string
  className?: string
  showNavigation?: boolean
  onNext?: () => void
  onPrev?: () => void
}

const WhatsAppImageViewer: React.FC<WhatsAppImageViewerProps> = ({
  src,
  alt = "Image",
  caption,
  className = "",
  showNavigation = false,
  onNext,
  onPrev,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
    resetImagePosition()
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = src
    link.download = alt || "whatsapp-image"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetImagePosition = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1))
    if (scale <= 1) {
      resetImagePosition()
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setStartPosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    const newX = e.clientX - startPosition.x
    const newY = e.clientY - startPosition.y

    // Calculate boundaries based on image and container dimensions
    if (imageRef.current && containerRef.current) {
      const imgWidth = imageRef.current.clientWidth * scale
      const imgHeight = imageRef.current.clientHeight * scale
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      const maxX = Math.max(0, (imgWidth - containerWidth) / 2)
      const maxY = Math.max(0, (imgHeight - containerHeight) / 2)

      setPosition({
        x: Math.min(maxX, Math.max(-maxX, newX)),
        y: Math.min(maxY, Math.max(-maxY, newY)),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "Escape":
        setIsOpen(false)
        break
      case "ArrowLeft":
        if (showNavigation && onPrev) onPrev()
        break
      case "ArrowRight":
        if (showNavigation && onNext) onNext()
        break
      case "+":
      case "=":
        zoomIn()
        break
      case "-":
        zoomOut()
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      resetImagePosition()
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, showNavigation, onNext, onPrev])

  return (
    <>
      {/* Thumbnail */}
      <div className={`relative cursor-pointer group ${className}`} onClick={() => setIsOpen(true)}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {hasError ? (
          <div className="bg-gray-200 rounded-lg flex items-center justify-center min-h-[120px]">
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm">Failed to load image</p>
            </div>
          </div>
        ) : (
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="rounded max-w-full h-auto group-hover:opacity-90 transition-opacity"
            style={{ display: isLoading ? "none" : "block" }}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/5 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-none w-full h-full p-0 bg-black/95 border-none [&>button]:hidden">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  {caption && <div className="text-sm text-white/90 max-w-md truncate">{caption}</div>}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={zoomOut}
                    disabled={scale <= 1}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button
                    onClick={zoomIn}
                    disabled={scale >= 3}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button onClick={handleDownload} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Image Container */}
            <div
              ref={containerRef}
              className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {isLoading && (
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {hasError ? (
                <div className="text-center text-white/70">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p>Failed to load image</p>
                </div>
              ) : (
                <img
                  ref={imageRef}
                  src={src || "/placeholder.svg"}
                  alt={alt}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className="max-w-full max-h-full object-contain select-none"
                  style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? "none" : "transform 0.2s ease-out",
                    display: isLoading ? "none" : "block",
                  }}
                  draggable={false}
                />
              )}
            </div>

            {/* Navigation */}
            {showNavigation && (
              <>
                {onPrev && (
                  <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {onNext && (
                  <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}

            {/* Bottom Caption */}
            {caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <p className="text-white text-center text-sm max-w-2xl mx-auto">{caption}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WhatsAppImageViewer

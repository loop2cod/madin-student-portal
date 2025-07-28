"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Mic, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppVoicePlayerProps {
  src?: string
  audioSrc?: string
  audioData?: string | Blob // Base64 string or Blob data
  audioMimeType?: string // MIME type for the audio (e.g., 'audio/mp3', 'audio/ogg')
  duration?: number
  isOutgoing?: boolean
  className?: string
}

export default function WhatsAppVoicePlayer({
  src,
  audioSrc,
  audioData,
  audioMimeType = 'audio/mpeg',
  duration,
  isOutgoing = false,
  className = ""
}: WhatsAppVoicePlayerProps) {
  // Use audioData if provided, otherwise fall back to URL
  const hasDirectData = !!audioData
  const audioSource = src || audioSrc || "/placeholder-audio.mp3"
  
  // Debug logging
  console.log("WhatsAppVoicePlayer props:", { 
    src, 
    audioSrc, 
    hasDirectData, 
    audioDataType: typeof audioData,
    audioMimeType,
    audioSource,
    duration 
  })

  // Immediately set error if no valid source is provided
  const [initialError] = useState(() => {
    if (!hasDirectData && (!audioSource || audioSource === "/placeholder-audio.mp3")) {
      console.error("No valid audio source or data provided")
      return true
    }
    return false
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [actualDuration, setActualDuration] = useState(duration || 0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLoading, setIsLoading] = useState(!initialError)
  const [hasError, setHasError] = useState(initialError)
  const [canPlay, setCanPlay] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
    setHasError(false)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setActualDuration(audioRef.current.duration)
      setIsLoading(false)
      setCanPlay(true)
    }
  }, [audioSource])

  const handleCanPlayThrough = useCallback(() => {
    setIsLoading(false)
    setCanPlay(true)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [])

  const handleError = useCallback((event?: Event) => {
    setIsLoading(false)
    setHasError(true)  
    setIsPlaying(false)
    console.error("Audio failed to load:", audioSource)
    console.error("Error event:", event)
    console.error("Audio element readyState:", audioRef.current?.readyState)
    console.error("Audio element error:", audioRef.current?.error)
    
    // For Safari, try to provide more specific error info
    if (isSafari && audioRef.current?.error) {
      const error = audioRef.current.error
      console.error("Safari audio error code:", error.code)
      console.error("Safari audio error message:", error.message)
    }
  }, [audioSource, isSafari])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || hasError) {
      console.warn("Cannot play audio:", { hasAudio: !!audio, hasError })
      return
    }

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        // Ensure we have a valid source before playing
        const validSource = blobUrl || audioSource
        if (!validSource || validSource === "/placeholder-audio.mp3") {
          console.log("No valid audio source available for playing")
          return
        }
        
        // For Safari without direct data, wait for blob URL
        if (isSafari && !hasDirectData && !blobUrl) {
          console.log("Safari: waiting for blob URL before playing")
          return
        }
        
        // Ensure the audio element has the correct source
        if (audio.src !== validSource) {
          audio.src = validSource
          audio.load()
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        // Handle play promise for better cross-browser support
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          await playPromise
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      setHasError(true)
      setIsPlaying(false)
    }
  }, [isPlaying, hasError, isSafari, blobUrl, audioSource, hasDirectData])

  const toggleSpeed = useCallback(() => {
    const speeds = [1, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)

    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }, [playbackSpeed])

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }, [])

  const progress = actualDuration > 0 ? Math.min((currentTime / actualDuration) * 100, 100) : 0

  // Generate stable waveform bars (avoid random on each render)
  const waveformBars = useRef(
    Array.from({ length: 30 }, (_, i) => {
      // Use a seeded pseudo-random function for consistent bars
      const seed = i * 16345
      const height = ((seed % 10) + 8)
      return { height }
    })
  ).current.map((bar, i) => ({
    ...bar,
    isActive: (i / 30) * 100 <= progress
  }))

  // Create blob URL from direct audio data
  const createBlobFromData = useCallback((data: string | Blob, mimeType: string) => {
    try {
      let blob: Blob
      
      if (data instanceof Blob) {
        console.log("Processing existing blob:", { 
          size: data.size, 
          type: data.type,
          actualMimeType: mimeType 
        })
        
        // If the blob type is empty or different from mimeType, create new blob with correct type
        if (!data.type || data.type !== mimeType) {
          console.log("Creating new blob with correct MIME type")
          blob = new Blob([data], { type: mimeType })
        } else {
          blob = data
        }
      } else if (typeof data === 'string') {
        // Handle base64 data
        const cleanData = data.replace(/^data:audio\/[^;]+;base64,/, '')
        const binaryString = atob(cleanData)
        const bytes = new Uint8Array(binaryString.length)
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        blob = new Blob([bytes], { type: mimeType })
      } else {
        throw new Error(`Invalid audio data type: ${typeof data}`)
      }
      
      console.log("Final audio blob:", { 
        size: blob.size, 
        type: blob.type,
        originalDataType: typeof data,
        mimeType: mimeType
      })
      
      if (blob.size === 0) {
        throw new Error("Created empty audio blob")
      }
      
      // Validate that this is likely audio data
      if (blob.size < 100) {
        console.warn("Audio blob seems very small, might be corrupted")
      }
      
      const blobUrl = URL.createObjectURL(blob)
      setBlobUrl(blobUrl)
      console.log("Blob URL created successfully:", blobUrl)
      
      return blobUrl
    } catch (error) {
      console.error("Failed to create blob from audio data:", error)
      console.error("Error details:", {
        dataType: typeof data,
        dataSize: data instanceof Blob ? data.size : data?.length,
        mimeType,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }, [])

  // Safari-specific audio loading using fetch + blob (fallback for URLs)
  const loadAudioForSafari = useCallback(async (url: string) => {
    try {
      console.log("Fetching audio for Safari:", url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'audio/*,*/*',
          'Range': 'bytes=0-',
        },
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log("Audio blob fetched:", { size: blob.size, type: blob.type })
      
      if (blob.size === 0) {
        throw new Error("Received empty audio blob")
      }
      
      const blobUrl = URL.createObjectURL(blob)
      setBlobUrl(blobUrl)
      console.log("Blob URL created from fetch:", blobUrl)
      
      return blobUrl
    } catch (error) {
      console.error("Failed to fetch audio for Safari:", error)
      throw error
    }
  }, [])

  useEffect(() => {
    // Detect Safari browser
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    setIsSafari(isSafariBrowser)

    const audio = audioRef.current
    if (!audio) return

    // Handle direct audio data first (works for all browsers)
    if (hasDirectData && !blobUrl && !hasError) {
      try {
        console.log("Attempting to create blob from direct data:", {
          dataType: typeof audioData,
          dataSize: audioData instanceof Blob ? audioData.size : audioData?.length,
          mimeType: audioMimeType
        })
        
        const createdBlobUrl = createBlobFromData(audioData!, audioMimeType)
        setIsLoading(false)
        setCanPlay(true)
        console.log("Audio blob created from direct data successfully:", createdBlobUrl)
        
        // Force audio element to reload with new blob URL
        if (audio && audio.src !== createdBlobUrl) {
          audio.src = createdBlobUrl
          audio.load()
        }
      } catch (error) {
        console.error("Failed to create blob from direct data:", error)
        console.error("AudioData details:", {
          type: typeof audioData,
          isBlob: audioData instanceof Blob,
          size: audioData instanceof Blob ? audioData.size : 'N/A',
          blobType: audioData instanceof Blob ? audioData.type : 'N/A',
          mimeType: audioMimeType
        })
        setHasError(true)
        setIsLoading(false)
        setCanPlay(false)
      }
    }
    // Fallback: Safari-specific loading with fetch for URLs
    else if (!hasDirectData && isSafariBrowser && !blobUrl && audioSource !== "/placeholder-audio.mp3" && !hasError) {
      loadAudioForSafari(audioSource)
        .then((url) => {
          console.log("Safari audio blob URL created successfully:", url)
          setIsLoading(false)
          setCanPlay(true)
          // Force audio element to reload with new src
          if (audio.src !== url) {
            audio.src = url
            audio.load()
          }
          })
        .catch((error) => {
          console.error("Safari audio loading failed:", error)
          setHasError(true)
          setIsLoading(false)
          setCanPlay(false)
        })
    }

    // Safari-specific timeout handler for loading
    let loadTimeout: NodeJS.Timeout | null = null
    
    const handleLoadTimeout = () => {
      if (isSafariBrowser && isLoading && !blobUrl) {
        console.warn("Safari audio load timeout, trying fetch fallback")
        loadAudioForSafari(audioSource)
          .catch(() => {
            console.warn("Safari audio fetch fallback failed, marking as error")
            setHasError(true)
            setIsLoading(false)
          })
      }
    }

    // Add all event listeners
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplaythrough', handleCanPlayThrough)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    
    // Safari-specific: add canplay event
    const handleCanPlay = () => {
      setCanPlay(true)
      setIsLoading(false)
      if (loadTimeout) {
        clearTimeout(loadTimeout)
        loadTimeout = null
      }
    }
    audio.addEventListener('canplay', handleCanPlay)

    // Set initial playback rate
    if (audio.readyState >= 1) {
      audio.playbackRate = playbackSpeed
    }

    // Safari timeout for loading
    if (isSafariBrowser) {
      loadTimeout = setTimeout(handleLoadTimeout, 3000)
    }

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplaythrough', handleCanPlayThrough)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('canplay', handleCanPlay)
      
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
      
      // Cleanup blob URL
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [
    handleLoadStart,
    handleLoadedMetadata,
    handleCanPlayThrough,
    handleTimeUpdate,
    handleEnded,
    handleError,
    handlePlay,
    handlePause,
    playbackSpeed,
    isLoading,
    blobUrl,
    loadAudioForSafari,
    createBlobFromData,
    audioSource,
    audioData,
    audioMimeType,
    hasDirectData,
    hasError
  ])

  if (hasError) {
    return (
      <div className={`max-w-sm mx-auto ${className}`}>
        <div
          className={`
            relative p-3 rounded-lg max-w-xs
            ${isOutgoing ? "bg-[#dcf8c6] ml-auto" : "bg-white border border-gray-200"}
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Audio unavailable</div>
              <div className="text-xs text-gray-500 mt-1 break-all">
                {hasDirectData ? 
                  `Data type: ${typeof audioData}, MIME: ${audioMimeType}` :
                  `Source: ${audioSource}`
                }
              </div>
              <div className="text-xs text-red-500 mt-1">
                {hasDirectData ? 
                  "Failed to create audio from provided data" :
                  "Consider sending audio data directly from backend instead of URL"
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      <div
        className={`
          relative p-3 rounded max-w-xs
          ${isOutgoing 
            ? "bg-[#dcf8c6] ml-auto" 
            : "bg-white border"
          }
        `}
      >
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <Button
            onClick={togglePlayPause}
            disabled={hasError || (isLoading && !isSafari)}
            size="icon"
            className={`
              w-10 h-10 rounded-full flex-shrink-0 transition-all duration-200
              ${hasError || (isLoading && !isSafari)
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-primary hover:bg-accent-foreground hover:scale-105 active:scale-95"
              }
              text-white border-0 shadow-md
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          {/* Waveform */}
          <div className="flex items-center gap-0.5 flex-1 h-8 px-1">
            {waveformBars.map((bar, index) => (
              <div
                key={index}
                className={`
                  w-1 rounded-full transition-colors duration-200 ease-in-out
                  ${bar.isActive
                    ? isOutgoing
                      ? "bg-primary"
                      : "bg-primary"
                    : isOutgoing
                      ? "bg-[#a8d8b8] opacity-60"
                      : "bg-gray-300 opacity-60"
                  }
                `}
                style={{ 
                  height: `${Math.max(4, Math.min(bar.height, 24))}px`,
                  minHeight: '4px'
                }}
              />
            ))}
          </div>

          {/* Time and Speed */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-gray-600 font-medium min-w-[50px] text-right">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-500 min-w-[50px] text-right">
              {formatTime(actualDuration)}
            </div>
            {actualDuration > 30 && canPlay && (
              <Button
                onClick={toggleSpeed}
                variant="ghost"
                size="sm"
                className="h-4 px-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
              >
                {playbackSpeed}×
              </Button>
            )}
          </div>
        </div>

        {/* Message tail */}
        <div
          className={`
            absolute bottom-0 w-0 h-0
            ${isOutgoing
              ? "right-0 translate-x-1 border-l-8 border-l-[#dcf8c6] border-b-8 border-b-transparent"
              : "left-0 -translate-x-1 border-r-8 border-r-white border-b-8 border-b-transparent"
            }
          `}
        />
      </div>

      {/* Hidden audio element with cross-browser attributes */}
      <audio
        ref={audioRef}
        src={blobUrl || audioSource}
        preload={hasDirectData ? "metadata" : (isSafari ? "none" : "metadata")}
        playsInline  
        {...(!blobUrl && !isSafari && audioSource?.startsWith('http') && { crossOrigin: "anonymous" })}
        style={{ display: 'none' }}
      />
    </div>
  )
}

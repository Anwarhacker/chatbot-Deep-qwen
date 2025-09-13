"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface MessageActionsProps {
  content: string
  messageId: string
  isBot?: boolean
  onRegenerate?: () => void
}

export function MessageActions({ content, messageId, isBot, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState<"up" | "down" | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast({ title: "Copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      try {
        const textArea = document.createElement("textarea")
        textArea.value = content
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        setCopied(true)
        toast({ title: "Copied to clipboard" })
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackError) {
        toast({ title: "Failed to copy", variant: "destructive" })
      }
    }
  }

  const handleRating = (newRating: "up" | "down") => {
    setRating(rating === newRating ? null : newRating)
    toast({
      title: rating === newRating ? "Rating removed" : `Message ${newRating === "up" ? "liked" : "disliked"}`,
    })
  }

  return (
    <div className="flex items-center gap-1 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-6 px-2 text-xs hover:bg-muted/80"
        title="Copy message"
      >
        {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      </Button>

      {isBot && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRating("up")}
            className={`h-6 px-2 text-xs hover:bg-muted/80 ${rating === "up" ? "text-green-600 bg-green-50 dark:bg-green-950" : ""}`}
            title="Like message"
          >
            <ThumbsUp className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRating("down")}
            className={`h-6 px-2 text-xs hover:bg-muted/80 ${rating === "down" ? "text-red-600 bg-red-50 dark:bg-red-950" : ""}`}
            title="Dislike message"
          >
            <ThumbsDown className="w-3 h-3" />
          </Button>

          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              className="h-6 px-2 text-xs hover:bg-muted/80"
              title="Regenerate response"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </>
      )}
    </div>
  )
}

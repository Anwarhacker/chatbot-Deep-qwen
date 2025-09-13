"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Settings, Trash2, Download, Moon, Sun, MessageSquare, Sparkles, Menu, X } from "lucide-react"
import { ModelSelector } from "@/components/model-selector"
import { MessageActions } from "@/components/message-actions"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function ChatbotPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("deepseek/deepseek-r1-0528-qwen3-8b:free")
  const [darkMode, setDarkMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentChat = chats.find((chat) => chat.id === currentChatId)
  const messages = currentChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setSidebarOpen(false)
  }

  useEffect(() => {
    if (chats.length === 0) {
      createNewChat()
    }
  }, [])

  const updateChatTitle = (chatId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "")
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)))
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentChatId) return

    const messageId = Date.now().toString()
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setChats((prev) =>
      prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages: [...chat.messages, userMessage] } : chat)),
    )

    if (messages.length === 0) {
      updateChatTitle(currentChatId, inputValue.trim())
    }

    setInputValue("")
    setIsLoading(true)
    setStreamingMessage("")

    try {
      const conversationArray = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationArray,
          model: selectedModel,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ""
                if (content) {
                  fullResponse += content
                  setStreamingMessage(fullResponse)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullResponse || "Sorry, I could not generate a response.",
        timestamp: new Date(),
        model: selectedModel,
      }

      setChats((prev) =>
        prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages: [...chat.messages, botMessage] } : chat)),
      )
    } catch (error) {
      console.error("Error calling chat API:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: [...chat.messages, errorMessage] } : chat,
        ),
      )
      toast({ title: "Error", description: "Failed to get response", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setStreamingMessage("")
      inputRef.current?.focus()
    }
  }

  const handleRegenerate = async () => {
    if (!currentChat || messages.length < 2 || isLoading) return

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUserMessage) return

    // Remove the last bot message
    const updatedMessages = messages.slice(0, -1)
    setChats((prev) => prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat)))

    // Trigger regeneration with the last user message
    const conversationArray = updatedMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    setIsLoading(true)
    setStreamingMessage("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationArray,
          model: selectedModel,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ""
                if (content) {
                  fullResponse += content
                  setStreamingMessage(fullResponse)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullResponse || "Sorry, I could not generate a response.",
        timestamp: new Date(),
        model: selectedModel,
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: [...updatedMessages, botMessage] } : chat,
        ),
      )
    } catch (error) {
      console.error("Error regenerating response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while regenerating the response. Please try again.",
        timestamp: new Date(),
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: [...updatedMessages, errorMessage] } : chat,
        ),
      )
      toast({ title: "Error", description: "Failed to regenerate response", variant: "destructive" })
    } finally {
      setIsLoading(false)
      setStreamingMessage("")
    }
  }

  const exportChat = () => {
    if (!currentChat) return

    const chatData = {
      title: currentChat.title,
      messages: currentChat.messages,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${currentChat.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Chat exported successfully" })
  }

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId)
      setCurrentChatId(remainingChats[0]?.id || null)
      if (remainingChats.length === 0) {
        createNewChat()
      }
    }
    toast({ title: "Chat deleted" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setSidebarOpen(false)
  }

  return (
    <div className={`flex h-screen ${darkMode ? "dark" : ""}`}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-80 max-w-[85vw] sm:max-w-80
        bg-background border-r flex flex-col
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              Chats
            </h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)} className="h-8 w-8 p-0">
                {darkMode ? <Sun className="w-3 h-3 sm:w-4 sm:h-4" /> : <Moon className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="h-8 w-8 p-0">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={createNewChat}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm"
            size="sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {showSettings && (
          <div className="p-3 sm:p-4 border-b bg-muted/50">
            <h3 className="font-medium mb-3 text-sm sm:text-base">Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">AI Model</label>
                <ModelSelector value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading} />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 border-b cursor-pointer hover:bg-muted/50 group touch-manipulation ${
                currentChatId === chat.id ? "bg-muted" : ""
              }`}
              onClick={() => selectChat(chat.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm sm:text-base">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{chat.messages.length} messages</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteChat(chat.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 touch-manipulation"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background min-w-0">
        <div className="border-b p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-8 w-8 p-0 flex-shrink-0"
              >
                <Menu className="w-4 h-4" />
              </Button>

              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold truncate">AI Chatbot</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                    {selectedModel.split("/")[1]?.split(":")[0] || "AI Model"}
                  </Badge>
                  {currentChat && <span className="truncate">{currentChat.messages.length} messages</span>}
                </div>
              </div>
            </div>

            {currentChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportChat}
                className="h-8 text-xs sm:text-sm bg-transparent"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 mb-4 text-muted-foreground/50" />
              <p className="text-base sm:text-lg font-medium text-center">Welcome to AI Chatbot</p>
              <p className="text-xs sm:text-sm text-center">Start a conversation by typing a message below</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 sm:gap-3 group ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </div>

              <Card
                className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] p-3 sm:p-4 ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.model && (
                      <span className="ml-2 hidden sm:inline">• {message.model.split("/")[1]?.split(":")[0]}</span>
                    )}
                  </p>
                </div>

                <MessageActions
                  content={message.content}
                  messageId={message.id}
                  isBot={message.role === "assistant"}
                  onRegenerate={
                    index === messages.length - 1 && message.role === "assistant" && !isLoading
                      ? handleRegenerate
                      : undefined
                  }
                />
              </Card>
            </div>
          ))}

          {streamingMessage && (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <Card className="max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] p-3 sm:p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{streamingMessage}</p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <Card className="max-w-xs p-3 sm:p-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 h-10 sm:h-9 text-base sm:text-sm"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="h-10 w-10 sm:h-9 sm:w-auto sm:px-3 p-0 sm:p-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

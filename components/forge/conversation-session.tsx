"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Mic, MicOff, Send, ArrowRight, User, Bot, Square, Check } from "lucide-react"
import type { Language } from "@/lib/types"

interface ConversationSessionProps {
  language: Language
  onComplete: (stats: { turnsCompleted: number; wordsProduced: number }) => void
  onExit: () => void
}

interface DialogueTurn {
  id: string
  speaker: "npc" | "user"
  text: string
  translation?: string
  userOptions?: string[]
}

interface Scenario {
  id: string
  title: string
  description: string
  setting: string
  dialogue: DialogueTurn[]
}

// Sample conversation scenarios
const scenarios: Record<Language, Scenario[]> = {
  ro: [
    {
      id: "ro-cafe",
      title: "La Cafenea",
      description: "Order a coffee at a Romanian café",
      setting: "You walk into a cozy café in Bucharest. The barista greets you.",
      dialogue: [
        {
          id: "1",
          speaker: "npc",
          text: "Bună ziua! Cu ce vă pot ajuta?",
          translation: "Good afternoon! How can I help you?",
        },
        {
          id: "2",
          speaker: "user",
          text: "",
          userOptions: [
            "Aș vrea o cafea, vă rog.",
            "Un cappuccino, vă rog.",
            "Ce aveți pe meniu?",
          ],
        },
        {
          id: "3",
          speaker: "npc",
          text: "Desigur! Doriți ceva de mâncare?",
          translation: "Of course! Would you like something to eat?",
        },
        {
          id: "4",
          speaker: "user",
          text: "",
          userOptions: [
            "Nu, mulțumesc. Doar cafeaua.",
            "Da, un croissant, vă rog.",
            "Ce recomandați?",
          ],
        },
        {
          id: "5",
          speaker: "npc",
          text: "Perfect! Sunt douăzeci de lei, vă rog.",
          translation: "Perfect! That's twenty lei, please.",
        },
        {
          id: "6",
          speaker: "user",
          text: "",
          userOptions: [
            "Poftim. Mulțumesc!",
            "Pot să plătesc cu cardul?",
            "Păstrați restul.",
          ],
        },
      ],
    },
  ],
  ko: [
    {
      id: "ko-cafe",
      title: "카페에서",
      description: "Order a drink at a Korean café",
      setting: "You enter a trendy café in Seoul. The staff welcomes you.",
      dialogue: [
        {
          id: "1",
          speaker: "npc",
          text: "어서오세요! 주문하시겠어요?",
          translation: "Welcome! Would you like to order?",
        },
        {
          id: "2",
          speaker: "user",
          text: "",
          userOptions: [
            "아메리카노 한 잔 주세요.",
            "카페라떼 주세요.",
            "메뉴 좀 볼 수 있을까요?",
          ],
        },
        {
          id: "3",
          speaker: "npc",
          text: "네! 사이즈는 어떻게 해 드릴까요?",
          translation: "Yes! What size would you like?",
        },
        {
          id: "4",
          speaker: "user",
          text: "",
          userOptions: [
            "그란데 사이즈로 주세요.",
            "제일 작은 거로 주세요.",
            "중간 사이즈요.",
          ],
        },
        {
          id: "5",
          speaker: "npc",
          text: "드시고 가세요, 아니면 포장해 드릴까요?",
          translation: "For here or to go?",
        },
        {
          id: "6",
          speaker: "user",
          text: "",
          userOptions: [
            "여기서 마실게요.",
            "포장해 주세요.",
            "테이크아웃이요.",
          ],
        },
      ],
    },
  ],
}

export function ConversationSession({ language, onComplete, onExit }: ConversationSessionProps) {
  const [currentScenario] = useState(scenarios[language][0])
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [chatHistory, setChatHistory] = useState<{ speaker: "npc" | "user"; text: string }[]>([])
  const [userInput, setUserInput] = useState("")
  const [showOptions, setShowOptions] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [wordsProduced, setWordsProduced] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentTurn = currentScenario.dialogue[currentTurnIndex]
  const isConversationComplete = currentTurnIndex >= currentScenario.dialogue.length

  // Add NPC message to chat if it's their turn
  const addNpcMessage = useCallback(() => {
    if (currentTurn && currentTurn.speaker === "npc") {
      setChatHistory((prev) => [
        ...prev,
        { speaker: "npc", text: currentTurn.text },
      ])
      setCurrentTurnIndex((prev) => prev + 1)
    }
  }, [currentTurn])

  // Initialize first NPC message
  useState(() => {
    if (currentScenario.dialogue[0]?.speaker === "npc") {
      setChatHistory([{ speaker: "npc", text: currentScenario.dialogue[0].text }])
      setCurrentTurnIndex(1)
    }
  })

  const handleSelectOption = (option: string) => {
    const words = option.split(/\s+/).filter((w) => w.length > 0).length
    setWordsProduced((prev) => prev + words)
    
    setChatHistory((prev) => [...prev, { speaker: "user", text: option }])
    setUserInput("")
    setShowOptions(true)

    // Move to next turn
    const nextIndex = currentTurnIndex + 1
    if (nextIndex < currentScenario.dialogue.length) {
      const nextTurn = currentScenario.dialogue[nextIndex]
      if (nextTurn.speaker === "npc") {
        // Add slight delay for NPC response
        setTimeout(() => {
          setChatHistory((prev) => [...prev, { speaker: "npc", text: nextTurn.text }])
          setCurrentTurnIndex(nextIndex + 1)
        }, 800)
      } else {
        setCurrentTurnIndex(nextIndex)
      }
    } else {
      setCurrentTurnIndex(nextIndex)
    }
  }

  const handleFreeResponse = () => {
    if (userInput.trim()) {
      const words = userInput.split(/\s+/).filter((w) => w.length > 0).length
      setWordsProduced((prev) => prev + words)
      
      setChatHistory((prev) => [...prev, { speaker: "user", text: userInput.trim() }])
      setUserInput("")

      // Move to next turn
      const nextIndex = currentTurnIndex + 1
      if (nextIndex < currentScenario.dialogue.length) {
        const nextTurn = currentScenario.dialogue[nextIndex]
        if (nextTurn.speaker === "npc") {
          setTimeout(() => {
            setChatHistory((prev) => [...prev, { speaker: "npc", text: nextTurn.text }])
            setCurrentTurnIndex(nextIndex + 1)
          }, 800)
        } else {
          setCurrentTurnIndex(nextIndex)
        }
      } else {
        setCurrentTurnIndex(nextIndex)
      }
    }
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        // In production, we'd transcribe this audio
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check your permissions.")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleComplete = () => {
    onComplete({
      turnsCompleted: chatHistory.filter((m) => m.speaker === "user").length,
      wordsProduced,
    })
  }

  // Get current user turn for options
  const currentUserTurn = currentScenario.dialogue[currentTurnIndex]
  const hasOptions = currentUserTurn?.speaker === "user" && currentUserTurn?.userOptions

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-forge/20 text-forge">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{currentScenario.title}</h2>
            <p className="text-sm text-muted-foreground">{currentScenario.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <Square className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>

      {/* Scenario setting */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
        <p className="text-sm text-muted-foreground italic">{currentScenario.setting}</p>
      </div>

      {/* Chat history */}
      <div className="p-4 rounded-xl border border-forge/30 bg-card min-h-[300px] max-h-[400px] overflow-y-auto space-y-4">
        {chatHistory.map((message, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3",
              message.speaker === "user" ? "justify-end" : "justify-start",
            )}
          >
            {message.speaker === "npc" && (
              <div className="w-8 h-8 rounded-full bg-forge/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-forge" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-2xl",
                message.speaker === "user"
                  ? "bg-forge text-forge-foreground rounded-br-md"
                  : "bg-secondary rounded-bl-md",
              )}
            >
              <p className="text-sm">{message.text}</p>
              {message.speaker === "npc" && currentScenario.dialogue.find(
                (t) => t.text === message.text && t.translation
              ) && (
                <p className="text-xs mt-1 opacity-70">
                  {currentScenario.dialogue.find((t) => t.text === message.text)?.translation}
                </p>
              )}
            </div>
            {message.speaker === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator when waiting for NPC */}
        {!isConversationComplete && currentTurn?.speaker === "npc" && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-forge/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-forge" />
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      {!isConversationComplete ? (
        <div className="space-y-4">
          {/* Response options */}
          {hasOptions && showOptions && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Choose a response or write your own:</p>
              <div className="space-y-2">
                {currentUserTurn.userOptions?.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 bg-transparent hover:bg-forge/10 hover:border-forge"
                    onClick={() => handleSelectOption(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(false)}
                className="text-muted-foreground"
              >
                Write my own response
              </Button>
            </div>
          )}

          {/* Free text input */}
          {(!hasOptions || !showOptions) && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response..."
                  className="min-h-[60px] pr-12"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleFreeResponse()
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-2 bottom-2"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4 text-red-500" />
                  ) : (
                    <Mic className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleFreeResponse}
                disabled={!userInput.trim()}
                className="bg-forge text-forge-foreground hover:bg-forge/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {isRecording && (
            <p className="text-sm text-center text-red-400">
              Recording... {formatDuration(recordingDuration)}
            </p>
          )}

          {hasOptions && !showOptions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOptions(true)}
              className="text-muted-foreground"
            >
              <ArrowRight className="w-4 h-4 mr-1 rotate-180" />
              Show response options
            </Button>
          )}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-foreground">Conversation Complete!</p>
            <p className="text-sm text-muted-foreground">
              You produced {wordsProduced} words across {chatHistory.filter((m) => m.speaker === "user").length} turns.
            </p>
          </div>
          <Button onClick={handleComplete} className="bg-forge text-forge-foreground hover:bg-forge/90">
            Finish Session
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Word count */}
      {!isConversationComplete && wordsProduced > 0 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Words produced: <span className="font-medium text-foreground">{wordsProduced}</span>
          </p>
        </div>
      )}
    </div>
  )
}

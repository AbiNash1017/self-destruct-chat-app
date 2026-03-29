"use client"

import { useUsername } from "@/hooks/use-username"
import { client } from "@/lib/client"
import { useRealtime } from "@/lib/realtime-client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { use, useEffect, useRef, useState } from "react"

function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string

  const router = useRouter()

  const { username } = useUsername()
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [copyStatus, setCopyStatus] = useState("COPY")
  const [showShareModal, setShowShareModal] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const { data: ttlData } = useQuery({
    queryKey: ["ttl", roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } })
      return res.data
    },
  })

  useEffect(() => {
    if (ttlData?.ttl !== undefined) setTimeRemaining(ttlData.ttl)
  }, [ttlData])

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return

    if (timeRemaining === 0) {
      router.push("/?destroyed=true")
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, router])

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } })
      return res.data
    },
  })

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post({ sender: username, text }, { query: { roomId } })

      setInput("")
    },
  })

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch()
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true")
      }
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } })
    },
  })

  useEffect(() => {
    if (messages?.messages.length === 0) {
      const hasSeen = sessionStorage.getItem(`share-modal-seen-${roomId}`)
      if (!hasSeen) {
        setShowShareModal(true)
        sessionStorage.setItem(`share-modal-seen-${roomId}`, "true")
      }
    }
  }, [messages, roomId])

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopyStatus("COPIED!")
    setTimeout(() => setCopyStatus("COPY"), 2000)
  }

  return (
    <main className="flex flex-col h-dvh max-h-dvh overflow-hidden bg-black">
      <header className="sticky top-0 z-20 border-b border-zinc-800 p-3 sm:p-4 flex items-center justify-between bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5 min-[400px]:gap-1">
            <span className="text-[10px] min-[400px]:text-xs text-zinc-500 uppercase tracking-tight">Room ID</span>
            <div className="flex items-center gap-1.5 min-[400px]:gap-2">
              <span className="font-bold text-green-500 truncate text-sm min-[400px]:text-base">
                <span className="inline min-[400px]:hidden">{roomId.slice(0, 6) + "..."}</span>
                <span className="hidden min-[400px]:inline">{roomId.slice(0, 10) + "..."}</span>
              </span>
              <button
                onClick={copyLink}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors uppercase font-bold"
              >
                {copyStatus === "COPY" ? "🔗" : "✅"}
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800 hidden min-[400px]:block" />

          <div className="flex flex-col min-w-fit">
            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase">Self-Destruct</span>
            <span
              className={`text-sm font-bold flex items-center gap-2 ${
                timeRemaining !== null && timeRemaining < 60
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : "--:--"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* CONFIRMATION STATE */}
          <button
            onClick={() => {
              if (confirm("🚨 DESTROY THIS ROOM PERMANENTLY?")) {
                destroyRoom()
              }
            }}
            className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-red-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 active:scale-95 sm:px-4 sm:py-2 sm:text-xs"
          >
            {/* Subtle Glow */}
            <div className="absolute inset-0 bg-red-500/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            
            <span className="relative z-10 text-base group-hover:animate-bounce">💣</span>
            <span className="relative z-10 hidden min-[500px]:inline">Destroy Room</span>
            <span className="relative z-10 min-[500px]:hidden">Destroy</span>
            
            {/* Scanning Line Effect */}
            <div className="absolute inset-0 z-0 h-full w-[2px] -translate-x-full bg-gradient-to-b from-transparent via-red-500/40 to-transparent group-hover:animate-loading-bar" />
          </button>
        </div>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 opacity-20">
              <p className="text-4xl text-zinc-500">💬</p>
              <p className="text-zinc-600 text-sm font-mono">
                Line is open. Start the transmission.
              </p>
            </div>
          </div>
        )}

        {messages?.messages.map((msg) => {
          const isSelf = msg.sender === username
          
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isSelf ? "items-end" : "items-start"} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] sm:max-w-[70%] group`}>
                {/* Meta Info */}
                <div className={`flex items-center gap-2 mb-1.5 px-1 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      isSelf ? "text-green-500/60" : "text-blue-500/60"
                    }`}
                  >
                    {isSelf ? "YOU" : msg.sender}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {format(msg.timestamp, "HH:mm")}
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`relative p-3.5 rounded-2xl border transition-all duration-300 ${
                    isSelf 
                      ? "bg-green-500/5 border-green-500/10 text-white rounded-tr-none hover:bg-green-500/10 hover:border-green-500/20 shadow-[0_0_20px_-12px_rgba(34,197,94,0.2)]" 
                      : "bg-zinc-900/40 border-zinc-800/80 text-zinc-100 rounded-tl-none hover:bg-zinc-800/60 hover:border-zinc-700 shadow-[0_0_20px_-12px_rgba(59,130,246,0.1)]"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  
                  {/* Subtle Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10 ${
                    isSelf ? "bg-green-500/5" : "bg-blue-500/5"
                  }`} />
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 border-t border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">
              {">"}
            </span>
            <input
              autoFocus
              type="text"
              value={input}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  sendMessage({ text: input })
                  inputRef.current?.focus()
                }
              }}
              placeholder="Type message..."
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-black border border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-3 pl-8 pr-4 text-sm"
            />
          </div>

          <button
            onClick={() => {
              sendMessage({ text: input })
              inputRef.current?.focus()
            }}
            disabled={!input.trim() || isPending}
            className="bg-zinc-800 text-zinc-400 px-6 text-sm font-bold hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            SEND
          </button>
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm p-6 shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-amber-500" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
            
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-4 pt-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl shadow-inner border border-zinc-700">
                🚀
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Ready to Chat?</h3>
                <p className="text-sm text-zinc-400 px-4">
                  This room is private and self-destructing. Share the link with your friends to start a secure conversation.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-black/50 border border-zinc-800 p-3 rounded text-xs font-mono text-zinc-500 truncate select-all">
                  {typeof window !== "undefined" ? window.location.href : "Generating link..."}
                </div>
                
                <button
                  onClick={() => {
                    copyLink()
                    // Optional: auto-close after copy with a delay?
                    // setTimeout(() => setShowShareModal(false), 800)
                  }}
                  className="w-full bg-white text-black py-3 font-bold text-sm hover:bg-zinc-200 transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {copyStatus === "COPY" ? "COPY INVITE LINK" : "✅ LINK COPIED!"}
                </button>
              </div>
              
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest pt-2">
                Secure • Encrypted • Ephemeral
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Page
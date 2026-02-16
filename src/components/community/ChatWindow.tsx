"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage, markMessagesRead } from "@/app/actions/community";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface ChatUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface ChatWindowProps {
  currentUserId: string;
  chatUser: ChatUser;
  messages: Message[];
  onBack: () => void;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
}

export default function ChatWindow({
  currentUserId,
  chatUser,
  messages,
  onBack,
}: ChatWindowProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    // Mark messages from this user as read
    markMessagesRead(chatUser.id);
  }, [chatUser.id, messages.length]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    await sendMessage(chatUser.id, content);
    setContent("");
    setSending(false);
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  const initials = (chatUser.full_name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50 bg-slate-900/50 shrink-0">
        <button
          onClick={onBack}
          className="lg:hidden p-1 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {chatUser.avatar_url ? (
          <img
            src={chatUser.avatar_url}
            alt={chatUser.full_name || ""}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold text-sm">
            {chatUser.full_name || "Usuario"}
          </h3>
          <span className="text-slate-500 text-xs capitalize">{chatUser.role}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center mb-3">
              <span className="text-slate-500 text-xs bg-slate-800/50 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            <div className="space-y-2">
              {group.msgs.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        isMine
                          ? "bg-cyan-600 text-white rounded-br-md"
                          : "bg-slate-800 text-slate-200 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMine ? "text-cyan-200/60" : "text-slate-500"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">
              Envía el primer mensaje a {chatUser.full_name || "este usuario"}
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-900/50 shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 resize-none text-sm min-h-[40px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 self-end"
            size="sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

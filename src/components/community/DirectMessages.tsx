"use client";

import { useState } from "react";
import { Search, MessageSquare, Menu } from "lucide-react";
import ChatWindow from "./ChatWindow";

interface ChatUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  user: ChatUser;
  lastMessage: string;
  lastDate: string;
  unreadCount: number;
}

interface DirectMessagesProps {
  currentUserId: string;
  allUsers: ChatUser[];
  messages: Message[];
}

export default function DirectMessages({
  currentUserId,
  allUsers,
  messages,
}: DirectMessagesProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Build conversations list from messages
  const conversationMap = new Map<string, Conversation>();

  messages.forEach((msg) => {
    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    const existing = conversationMap.get(otherId);
    const msgDate = new Date(msg.created_at).getTime();

    if (!existing || new Date(existing.lastDate).getTime() < msgDate) {
      const otherUser = allUsers.find((u) => u.id === otherId);
      if (!otherUser) return;

      const unread = messages.filter(
        (m) => m.sender_id === otherId && m.receiver_id === currentUserId && !m.read
      ).length;

      conversationMap.set(otherId, {
        user: otherUser,
        lastMessage: msg.content,
        lastDate: msg.created_at,
        unreadCount: unread,
      });
    }
  });

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
  );

  // Users without conversations
  const usersWithConversations = new Set(conversationMap.keys());
  const otherUsers = allUsers
    .filter((u) => u.id !== currentUserId && !usersWithConversations.has(u.id))
    .filter((u) =>
      search
        ? u.full_name?.toLowerCase().includes(search.toLowerCase())
        : true
    );

  // Filtered conversations
  const filteredConversations = search
    ? conversations.filter((c) =>
        c.user.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  // Get messages for selected user
  const selectedUser = allUsers.find((u) => u.id === selectedUserId);
  const chatMessages = selectedUserId
    ? messages
        .filter(
          (m) =>
            (m.sender_id === currentUserId && m.receiver_id === selectedUserId) ||
            (m.sender_id === selectedUserId && m.receiver_id === currentUserId)
        )
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  function UserAvatar({ user, size = "md" }: { user: ChatUser; size?: "sm" | "md" }) {
    const s = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
    const initials = (user.full_name || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    if (user.avatar_url) {
      return <img src={user.avatar_url} alt="" className={`${s} rounded-full object-cover`} />;
    }
    return (
      <div className={`${s} rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold`}>
        {initials}
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Left: Users list */}
      <div
        className={`w-full lg:w-80 border-r border-slate-700/50 flex flex-col shrink-0 ${
          selectedUserId ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Search */}
        <div className="p-3 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active conversations */}
          {filteredConversations.length > 0 && (
            <div>
              <p className="px-4 py-2 text-slate-500 text-xs uppercase tracking-wider">
                Conversaciones
              </p>
              {filteredConversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setSelectedUserId(conv.user.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left ${
                    selectedUserId === conv.user.id ? "bg-slate-800/70" : ""
                  }`}
                >
                  <UserAvatar user={conv.user} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate">
                        {conv.user.full_name || "Usuario"}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs truncate">{conv.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Other users */}
          {otherUsers.length > 0 && (
            <div>
              <p className="px-4 py-2 text-slate-500 text-xs uppercase tracking-wider">
                Usuarios
              </p>
              {otherUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-300 text-sm truncate block">
                      {user.full_name || "Usuario"}
                    </span>
                    <span className="text-slate-600 text-xs capitalize">{user.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {filteredConversations.length === 0 && otherUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <MessageSquare className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Chat */}
      <div
        className={`flex-1 flex flex-col ${
          selectedUserId ? "flex" : "hidden lg:flex"
        }`}
      >
        {selectedUser ? (
          <ChatWindow
            currentUserId={currentUserId}
            chatUser={selectedUser}
            messages={chatMessages}
            onBack={() => setSelectedUserId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-white font-semibold mb-1">Mensajes Directos</h3>
            <p className="text-slate-500 text-sm">
              Selecciona un usuario para iniciar una conversación
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

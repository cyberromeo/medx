"use client";

import { useEffect, useRef, useState } from "react";
import { client, databases, account } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Loader2, Sparkles, ArrowDown, X } from "lucide-react";

const MAX_MESSAGES = 50;

export default function DiscussPanel({ onClose, className = "" }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const CHAT_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const current = await account.get();
        setUser(current);
      } catch {
        // Read-only for unauthenticated users
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(DB_ID, CHAT_COL_ID, [
          Query.orderDesc("$createdAt"),
          Query.limit(MAX_MESSAGES)
        ]);
        setMessages(response.documents.reverse());
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchMessages();

    const unsubscribe = client.subscribe(
      `databases.${DB_ID}.collections.${CHAT_COL_ID}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.create")) {
          setMessages((prev) => {
            if (prev.some(m => m.$id === response.payload.$id)) return prev;
            const updated = [...prev, response.payload];
            return updated.slice(-MAX_MESSAGES);
          });
        }
        if (response.events.includes("databases.*.collections.*.documents.delete")) {
          setMessages((prev) => prev.filter(m => m.$id !== response.payload.$id));
        }
      }
    );

    return () => unsubscribe();
  }, [DB_ID, CHAT_COL_ID]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const response = await databases.createDocument(DB_ID, CHAT_COL_ID, ID.unique(), {
        content: newMessage,
        userId: user.$id,
        userName: user.name,
        userAvatar: ""
      });

      setMessages((prev) => [...prev, response]);
      setNewMessage("");

      await cleanupOldMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const cleanupOldMessages = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, CHAT_COL_ID, [
        Query.orderAsc("$createdAt"),
        Query.limit(200)
      ]);

      if (response.documents.length > MAX_MESSAGES) {
        const toDelete = response.documents.slice(0, response.documents.length - MAX_MESSAGES);
        for (const doc of toDelete) {
          await databases.deleteDocument(DB_ID, CHAT_COL_ID, doc.$id);
        }
      }
    } catch (error) {
      console.error("Error cleaning up old messages:", error);
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "from-violet-500 to-purple-600",
      "from-fuchsia-500 to-violet-600",
      "from-purple-500 to-indigo-600",
      "from-indigo-500 to-fuchsia-600",
      "from-violet-400 to-pink-500",
      "from-purple-500 to-fuchsia-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section className={`panel rounded-3xl overflow-hidden flex flex-col ${className}`}>
      <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 grad-primary rounded-xl flex items-center justify-center shadow-lg">
            <MessageCircle className="text-white" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              Discuss
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
            </h1>
            <p className="text-muted text-[11px] truncate">{messages.length} messages</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-[10px] text-muted truncate max-w-[100px]">
                {user.name}
              </p>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all active:scale-95"
              aria-label="Close discuss"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
      >
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary-soft animate-ping absolute" />
                <Loader2 className="animate-spin text-primary relative" size={26} />
              </div>
              <p className="text-muted text-sm">Loading messages...</p>
            </div>
          </div>
        )}

        {!loading && (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = user && msg.userId === user.$id;
              const isSequence = index > 0 && messages[index - 1].userId === msg.userId;
              const showTime = !isSequence || index === messages.length - 1;

              return (
                <motion.div
                  key={msg.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isSequence ? "mt-0.5" : "mt-4"}`}
                >
                  {!isSequence ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold bg-gradient-to-br ${getAvatarColor(msg.userName)} text-white shadow-md`}>
                      {msg.userName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7" />
                  )}

                  <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {!isSequence && !isMe && (
                      <p className="text-[10px] text-muted mb-0.5 ml-1">{msg.userName}</p>
                    )}
                    <div className={`px-3 py-2 text-[13px] md:text-sm break-words leading-relaxed ${isMe
                      ? "bg-primary-soft text-white rounded-2xl rounded-tr-md border border-primary-soft"
                      : "bg-white/5 text-white/90 rounded-2xl rounded-tl-md border border-white/10 hover:bg-white/10 transition-colors"
                      }`}>
                      {msg.content}
                    </div>
                    {showTime && (
                      <p className={`text-[9px] text-muted mt-1 ${isMe ? "mr-1" : "ml-1"}`}>
                        {new Date(msg.$createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        <div ref={messagesEndRef} className="h-4" />

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Sparkles size={24} className="text-muted" />
            </div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-muted mt-1">Be the first to say hello</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-4 w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:bg-white/20 transition-colors z-20"
          >
            <ArrowDown size={16} className="text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="shrink-0 px-3 py-4 bg-black/60 backdrop-blur-xl border-t border-white/5">
        {user ? (
          <form onSubmit={sendMessage} className="chat-input flex items-center gap-2 bg-black/70 rounded-2xl p-1.5 transition-colors">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-3 py-2.5 text-base md:text-sm"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-10 h-10 grad-primary text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:scale-95 active:scale-90 shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
          </form>
        ) : (
          <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 text-center">
            <p className="text-muted text-sm">Sign in to join the conversation</p>
          </div>
        )}
      </div>
    </section>
  );
}

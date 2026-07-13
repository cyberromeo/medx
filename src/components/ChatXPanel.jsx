"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  getDocs,
  deleteDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageCircle,
  Loader2,
  Sparkles,
  ArrowDown,
  X,
} from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";

const MAX_MESSAGES = 50;

export default function DiscussPanel({ onClose, className = "" }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [avatarSeed, setAvatarSeed] = useState("fallback");
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const CHAT_COL_ID = "chat_messages";

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAvatarSeed(currentUser.uid);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().avatarSeed) {
            setAvatarSeed(userDoc.data().avatarSeed);
          }
        } catch (e) {
          console.error("Error fetching avatar", e);
        }
      }
    });

    const messagesRef = collection(db, CHAT_COL_ID);
    const q = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(MAX_MESSAGES),
    );

    const unsubscribeMessages = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((docSnap) => ({
          $id: docSnap.id,
          ...docSnap.data(),
        }));
        setMessages(msgs.reverse());
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const messagesRef = collection(db, CHAT_COL_ID);
      await addDoc(messagesRef, {
        content: newMessage,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "User",
        userAvatar: avatarSeed,
        createdAt: new Date().toISOString(),
      });

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
      const messagesRef = collection(db, CHAT_COL_ID);
      const q = query(messagesRef, orderBy("createdAt", "asc"), limit(200));
      const snapshot = await getDocs(q);

      if (snapshot.docs.length > MAX_MESSAGES) {
        const toDelete = snapshot.docs.slice(
          0,
          snapshot.docs.length - MAX_MESSAGES,
        );
        for (const docSnap of toDelete) {
          await deleteDoc(doc(db, CHAT_COL_ID, docSnap.id));
        }
      }
    } catch (error) {
      console.error("Error cleaning up old messages:", error);
    }
  };

  return (
    <section
      className={`panel flex flex-col overflow-hidden rounded-3xl ${className}`}
    >
      <div className="shrink-0 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grad-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
            <MessageCircle className="text-white" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              Discuss
              <span className="relative flex h-2 w-2">
                <span className="bg-secondary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-secondary relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
            </h1>
            <p className="text-muted truncate text-[11px]">
              {messages.length} messages
            </p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-muted max-w-[100px] truncate text-[10px]">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </p>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 active:scale-95"
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
        className="flex-1 space-y-1 overflow-y-auto px-4 py-3"
      >
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="bg-primary-soft absolute h-10 w-10 animate-ping rounded-full" />
                <Loader2
                  className="text-primary relative animate-spin"
                  size={26}
                />
              </div>
              <p className="text-muted text-sm">Loading messages...</p>
            </div>
          </div>
        )}

        {!loading && (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = user && msg.userId === user.uid;
              const isSequence =
                index > 0 && messages[index - 1].userId === msg.userId;
              const showTime = !isSequence || index === messages.length - 1;
              const showAvatar = !isSequence;

              return (
                <motion.div
                  key={msg.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isSequence ? "mt-0.5" : "mt-4"}`}
                >
                  {!isMe && showAvatar && (
                    <img 
                      src={getAvatarUrl(msg.userAvatar || msg.userId || msg.userName)} 
                      alt="Avatar"
                      className="w-7 h-7 rounded-full shrink-0 shadow-md bg-white border border-gray-100 object-cover"
                    />
                  )}
                  {!isMe && !showAvatar && <div className="w-7 shrink-0" />}

                  <div
                    className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}
                  >
                    {!isSequence && !isMe && (
                      <p className="text-muted mb-0.5 ml-1 text-[10px]">
                        {msg.userName}
                      </p>
                    )}
                    <div
                      className={`px-3 py-2 text-[13px] leading-relaxed break-words md:text-sm ${
                        isMe
                          ? "rounded-2xl rounded-tr-md bg-blue-600 text-white shadow-sm"
                          : "rounded-2xl rounded-tl-md border border-gray-100 bg-white text-gray-800 shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {showTime && msg.createdAt && (
                      <p
                        className={`text-muted mt-1 text-[9px] ${isMe ? "mr-1" : "ml-1"}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
          <div className="text-muted flex flex-col items-center justify-center py-16">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <Sparkles size={24} className="text-gray-400" />
            </div>
            <p className="text-sm">No messages yet</p>
            <p className="text-muted mt-1 text-xs">Be the first to say hello</p>
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
            className="absolute right-4 bottom-24 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
          >
            <ArrowDown size={16} className="text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="shrink-0 border-t border-gray-100 bg-white/80 px-3 py-4 backdrop-blur-xl">
        {user ? (
          <form
            onSubmit={sendMessage}
            className="chat-input flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-100 p-1.5 transition-colors"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border-none bg-transparent px-3 py-2.5 text-base text-gray-900 placeholder-gray-500 outline-none md:text-sm"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="grad-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-all active:scale-90 disabled:scale-95 disabled:opacity-30"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} className="ml-0.5" />
              )}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-center backdrop-blur-xl">
            <p className="text-muted text-sm">
              Sign in to join the conversation
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

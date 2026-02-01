"use client";

import { useEffect, useState, useRef } from "react";
import { client, databases, account } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Loader2, Sparkles, ArrowDown } from "lucide-react";

const MAX_MESSAGES = 50;

export default function ChatXPage() {
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

    // Handle scroll to show/hide scroll button
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
        checkSession();
        fetchMessages();

        const unsubscribe = client.subscribe(
            `databases.${DB_ID}.collections.${CHAT_COL_ID}.documents`,
            (response) => {
                if (response.events.includes("databases.*.collections.*.documents.create")) {
                    setMessages((prev) => {
                        const updated = [...prev, response.payload];
                        // Keep only last MAX_MESSAGES in UI
                        return updated.slice(-MAX_MESSAGES);
                    });
                }
                if (response.events.includes("databases.*.collections.*.documents.delete")) {
                    setMessages((prev) => prev.filter(m => m.$id !== response.payload.$id));
                }
            }
        );

        return () => unsubscribe();
    }, []);

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
            // Fetch only the 50 most recent messages
            const response = await databases.listDocuments(DB_ID, CHAT_COL_ID, [
                Query.orderDesc("$createdAt"),
                Query.limit(MAX_MESSAGES)
            ]);
            // Reverse to display oldest first
            setMessages(response.documents.reverse());
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || sending) return;

        setSending(true);
        try {
            // Create new message
            await databases.createDocument(DB_ID, CHAT_COL_ID, ID.unique(), {
                content: newMessage,
                userId: user.$id,
                userName: user.name,
                userAvatar: ""
            });
            setNewMessage("");

            // Auto-delete old messages if exceeding limit
            await cleanupOldMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const cleanupOldMessages = async () => {
        try {
            // Get total count
            const response = await databases.listDocuments(DB_ID, CHAT_COL_ID, [
                Query.orderAsc("$createdAt"),
                Query.limit(200)
            ]);

            // If more than MAX_MESSAGES, delete the oldest ones
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

    // Generate consistent color from username
    const getAvatarColor = (name) => {
        const colors = [
            "from-violet-500 to-purple-600",
            "from-blue-500 to-cyan-500",
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-amber-500",
            "from-pink-500 to-rose-500",
            "from-indigo-500 to-blue-600",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="aurora-bg" />
                <div className="flex items-center justify-center h-screen">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-primary/20 animate-ping absolute" />
                            <Loader2 className="animate-spin text-primary relative" size={32} />
                        </div>
                        <p className="text-gray-500 text-sm">Loading messages...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="aurora-bg" />

            {/* Main Chat Container */}
            <div className="flex-1 flex flex-col h-[100dvh] pt-16 md:pt-20">

                {/* Compact Chat Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="shrink-0 px-4 py-3 border-b border-white/5 bg-background/80 backdrop-blur-xl"
                >
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary via-blue-500 to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <MessageCircle className="text-white" size={18} />
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                    ChatX
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-[11px]">{messages.length} messages</p>
                            </div>
                        </div>
                        {user && (
                            <div className="text-right">
                                <p className="text-xs text-gray-400">{user.name}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Messages Area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
                >
                    <div className="max-w-3xl mx-auto">
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
                                        {/* Avatar */}
                                        {!isSequence ? (
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold bg-gradient-to-br ${getAvatarColor(msg.userName)} text-white shadow-md`}>
                                                {msg.userName.charAt(0).toUpperCase()}
                                            </div>
                                        ) : (
                                            <div className="w-7" />
                                        )}

                                        {/* Message Content */}
                                        <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                                            {!isSequence && !isMe && (
                                                <p className="text-[10px] text-gray-500 mb-0.5 ml-1">{msg.userName}</p>
                                            )}
                                            <div className={`px-3 py-2 text-[13px] md:text-sm break-words leading-relaxed ${isMe
                                                ? "bg-gradient-to-br from-primary/30 to-blue-500/20 text-white rounded-2xl rounded-tr-md border border-primary/20"
                                                : "bg-white/[0.04] text-gray-200 rounded-2xl rounded-tl-md border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                                                }`}>
                                                {msg.content}
                                            </div>
                                            {showTime && (
                                                <p className={`text-[9px] text-gray-600 mt-1 ${isMe ? "mr-1" : "ml-1"}`}>
                                                    {new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <div ref={messagesEndRef} className="h-4" />

                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Sparkles size={28} className="text-gray-500" />
                                </div>
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs text-gray-700 mt-1">Be the first to say hello!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scroll to bottom button */}
                <AnimatePresence>
                    {showScrollBtn && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scrollToBottom()}
                            className="fixed bottom-24 md:bottom-28 right-4 md:right-8 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:bg-white/20 transition-colors z-20"
                        >
                            <ArrowDown size={18} className="text-white" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="shrink-0 px-4 pb-20 md:pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
                    <div className="max-w-3xl mx-auto">
                        {user ? (
                            <form onSubmit={sendMessage} className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-1.5 focus-within:border-primary/30 transition-colors shadow-lg">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-3 py-2 text-sm"
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="w-10 h-10 bg-primary hover:bg-primary/90 text-black rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:scale-95 active:scale-90 shrink-0"
                                >
                                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 text-center">
                                <p className="text-gray-500 text-sm">Sign in to join the conversation</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
```

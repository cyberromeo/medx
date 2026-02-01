"use client";

import { useEffect, useState, useRef } from "react";
import { client, databases, account } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, User, Loader2, Sparkles } from "lucide-react";

export default function ChatXPage() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const CHAT_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID;

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        checkSession();
        fetchMessages();

        // Subscribe to real-time updates
        const unsubscribe = client.subscribe(
            `databases.${DB_ID}.collections.${CHAT_COL_ID}.documents`,
            (response) => {
                if (response.events.includes("databases.*.collections.*.documents.create")) {
                    setMessages((prev) => [...prev, response.payload]);
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, []);

    const checkSession = async () => {
        try {
            const current = await account.get();
            setUser(current);
        } catch {
            // Redirect or show login prompt if needed, for public wall we might show read-only? 
            // Implementation plan said authenticated users only.
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await databases.listDocuments(DB_ID, CHAT_COL_ID, [
                Query.orderAsc("$createdAt"),
                Query.limit(100)
            ]);
            setMessages(response.documents);
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
            await databases.createDocument(DB_ID, CHAT_COL_ID, ID.unique(), {
                content: newMessage,
                userId: user.$id,
                userName: user.name,
                userAvatar: "" // Reserved for future
            });
            setNewMessage("");
            // Optimistic update handled by real-time subscription usually, 
            // but for instant feedback we might await. 
            // Real-time is fast enough generally.
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="aurora-bg" />
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="aurora-bg" />

            {/* Chat Container */}
            <div className="container mx-auto px-4 pt-24 pb-20 flex-1 flex flex-col max-w-4xl h-[calc(100vh-80px)]">

                {/* Chat Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-4 p-4 glass-panel rounded-2xl"
                >
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                        <MessageSquare className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            ChatX <span className="text-primary text-xs px-2 py-0.5 border border-primary/30 rounded-full">LIVE</span>
                        </h1>
                        <p className="text-gray-400 text-xs">Public Wall • {messages.length} messages</p>
                    </div>
                </motion.div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto hide-scrollbar glass-panel rounded-2xl p-4 sm:p-6 mb-4 flex flex-col gap-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, index) => {
                            const isMe = user && msg.userId === user.$id;
                            // Check if previous message was from same user to group them
                            const isSequence = index > 0 && messages[index - 1].userId === msg.userId;

                            return (
                                <motion.div
                                    key={msg.$id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} ${isSequence ? "mt-1" : "mt-4"}`}
                                >
                                    {/* Avatar */}
                                    {!isSequence ? (
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-lg
                                            ${isMe
                                                ? "bg-gradient-to-br from-primary to-blue-600 text-white"
                                                : "bg-white/10 text-gray-300"
                                            }`}
                                        >
                                            {isMe ? <User size={14} /> : msg.userName.charAt(0).toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="w-8" />
                                    )}

                                    {/* Bubble */}
                                    <div className={`max-w-[80%] sm:max-w-[70%] group`}>
                                        {!isSequence && !isMe && (
                                            <p className="text-[10px] text-gray-400 ml-1 mb-1">{msg.userName}</p>
                                        )}
                                        <div className={`px-4 py-2 rounded-2xl text-sm sm:text-base break-words relative
                                            ${isMe
                                                ? "bg-primary/20 border border-primary/30 text-white rounded-tr-sm"
                                                : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm hover:bg-white/10 transition-colors"
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <p className={`text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-right" : "text-left"}`}>
                                            {new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                            <Sparkles size={48} className="mb-2" />
                            <p>Be the first to say hello!</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                {user ? (
                    <form onSubmit={sendMessage} className="glass-panel p-2 rounded-xl flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-4"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="bg-primary hover:bg-primary/80 text-black p-3 rounded-lg transition-all disabled:opacity-50 disabled:scale-95 active:scale-90"
                        >
                            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                ) : (
                    <div className="glass-panel p-4 rounded-xl text-center">
                        <p className="text-gray-500 text-sm">Sign in to participate in the chat</p>
                    </div>
                )}
            </div>
        </main>
    );
}

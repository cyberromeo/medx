"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import ChatXOverlay from "@/components/ChatXOverlay";

const ChatXContext = createContext(null);

export function ChatXProvider({ children }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(() => ({
    open,
    openChat: () => setOpen(true),
    closeChat: () => setOpen(false),
    toggleChat: () => setOpen((prev) => !prev),
  }), [open]);

  return (
    <ChatXContext.Provider value={value}>
      {children}
      <ChatXOverlay open={open} onClose={value.closeChat} />
    </ChatXContext.Provider>
  );
}

export function useChatX() {
  const ctx = useContext(ChatXContext);
  if (!ctx) throw new Error("useChatX must be used within ChatXProvider");
  return ctx;
}

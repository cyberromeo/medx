"use client";

import ChatXPanel from "@/components/ChatXPanel";

export default function ChatXPage() {
  return (
    <main className="min-h-screen">
      <div className="halo-bg" />
      <div className="grid-bg" />
      <div className="container mx-auto px-4 sm:px-6 pt-20 pb-10">
        <ChatXPanel className="max-w-4xl mx-auto h-[78vh]" />
      </div>
    </main>
  );
}

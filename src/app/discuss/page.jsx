"use client";

import ChatXPanel from "@/components/ChatXPanel";

export default function DiscussPage() {
  return (
    <main className="min-h-screen">
      <div className="halo-bg" />
      <div className="grid-bg" />
      <div className="container mx-auto px-4 pt-20 pb-10 sm:px-6">
        <ChatXPanel className="mx-auto h-[78vh] max-w-4xl" />
      </div>
    </main>
  );
}

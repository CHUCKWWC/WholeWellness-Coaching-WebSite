import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type ChatUIState = { chatActive: boolean; setChatActive: (v: boolean) => void };

const ChatUI = createContext<ChatUIState | null>(null);

export function ChatUIProvider({ children }: { children: ReactNode }) {
  const [chatActive, setChatActive] = useState(false);
  const value = useMemo(() => ({ chatActive, setChatActive }), [chatActive]);
  return <ChatUI.Provider value={value}>{children}</ChatUI.Provider>;
}

export function useChatUI() {
  const ctx = useContext(ChatUI);
  if (!ctx) throw new Error("useChatUI must be used inside <ChatUIProvider/>");
  return ctx;
}

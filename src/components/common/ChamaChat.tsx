import { useRef, useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ChatMessage } from "@/stores/chatStore";

export interface ChamaChatProps {
  chamaId: string;
  messages: ChatMessage[];
  onSend: (content: string) => void;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export function ChamaChat({ messages, onSend, currentUser }: ChamaChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden">
      {messages.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Start the conversation!"
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px] min-h-[300px]">
          {messages.map((msg) => {
            const isOwn = msg.userId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 max-w-[85%] sm:max-w-[70%]",
                  isOwn ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <Avatar
                  src={msg.userAvatar}
                  name={msg.userName}
                  size="xs"
                  className="mt-1 shrink-0"
                />
                <div>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words",
                      isOwn
                        ? "bg-brand-600 text-white rounded-tr-md"
                        : "bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-gray-100 rounded-tl-md"
                    )}
                  >
                    {msg.content}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2 mt-0.5",
                      isOwn ? "justify-end" : ""
                    )}
                  >
                    {!isOwn && (
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        {msg.userName}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-gray-200 dark:border-white/[0.06] p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          variant="filled"
        />
        <Button
          onClick={handleSend}
          variant="primary"
          size="sm"
          leftIcon={<Send className="h-4 w-4" />}
          disabled={!input.trim()}
          className="shrink-0"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

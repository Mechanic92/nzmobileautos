import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { COMPANY_INFO } from "@/const";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(() => nanoid());
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: any; timestamp: Date }>>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");

    setIsSending(true);
    try {
      // Send conversation history for context-aware responses
      const history = messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ 
          sessionId, 
          message: currentMessage,
          history 
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Chat request failed");
      }

      const data = (await res.json()) as { message?: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || "(no response)", timestamp: new Date() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry — the chat service is unavailable right now. Please try again later or call ${COMPANY_INFO.phone}.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 border-2 border-primary">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-bold">Mobile Autoworks Assistant</h3>
                <p className="text-xs opacity-90">Ask us anything!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Welcome to Mobile Autoworks!</p>
                <p className="text-sm mt-2">How can we help you today?</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setMessage("What services do you offer?")}
                    className="block w-full text-left p-2 rounded bg-background hover:bg-muted text-sm"
                  >
                    💡 What services do you offer?
                  </button>
                  <button
                    onClick={() => setMessage("How much do WOF remedial repairs cost?")}
                    className="block w-full text-left p-2 rounded bg-background hover:bg-muted text-sm"
                  >
                    💰 How much do WOF remedial repairs cost?
                  </button>
                  <button
                    onClick={() => setMessage("Do you cover my area?")}
                    className="block w-full text-left p-2 rounded bg-background hover:bg-muted text-sm"
                  >
                    📍 Do you cover my area?
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by AI • Available 24/7
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

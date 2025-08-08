
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { generateSpandiResponse } from "@/ai/flows/generate-spandi-response";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, User, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const initialMessage: Message = {
    id: 1,
    role: "assistant",
    content:
      "Namaskaram! Njan Spandi Bot. Enthu venamenkilum choyicho... But be careful what you wish for, because life is like a Kerala road, full of surprises and potholes.",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with initial message only once
    if (messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const { manglishResponse } =
        await generateSpandiResponse({ question: currentInput });

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: manglishResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        variant: "destructive",
        title: "Ayyoo, daivame!",
        description: "Ente signal poyi. Onnu koode try cheyyamo?",
      });
      // Restore user input if API call fails
      setInput(currentInput);
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="p-4 border-b border-border shadow-lg bg-card/50 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
            <Star className="text-accent" />
            <h1 className="text-2xl font-bold font-headline text-center text-primary-foreground">
                Spandi Bot
            </h1>
            <Star className="text-accent" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-end">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 md:gap-4",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <Avatar className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card-foreground">
                  <Bot className="h-6 w-6 text-accent" />
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-xl p-4 max-w-lg shadow-md",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === "user" && (
                <Avatar className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                  <User className="h-6 w-6 text-primary-foreground" />
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 md:gap-4 justify-start">
              <Avatar className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card-foreground">
                <Bot className="h-6 w-6 text-accent" />
              </Avatar>
              <div className="rounded-xl p-4 bg-card text-card-foreground shadow-md">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="h-2.5 w-2.5 bg-muted-foreground rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 md:gap-4"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enthenkilum choyicho..."
              className="flex-1 bg-input/80 focus-visible:ring-accent"
              disabled={isLoading}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Send Message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { getHoroscope } from "@/ai/flows/get-horoscope-flow";
import { roastFollowUp } from "@/ai/flows/roast-follow-up-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Star, Loader2, KeyRound, Calendar as CalendarIcon, User, VenetianMask, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type Horoscope = {
  title: string;
  prediction: string;
};

type Message = {
  role: 'user' | 'bot';
  text: string;
}

const apiKeyMissing = !process.env.NEXT_PUBLIC_GEMINI_API_KEY_CHECK;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [followUp, setFollowUp] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [conversation]);


  const handleGetHoroscope = async () => {
    if (!date || !name || !gender) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter your name, gender, and date of birth.",
        });
        return;
    }

    setIsLoading(true);
    setHoroscope(null);
    setConversation([]);

    try {
      const dateOfBirth = format(date, "yyyy-MM-dd");
      const { title, prediction } = await getHoroscope({ name, gender, dateOfBirth });
      setHoroscope({ title, prediction });
    } catch (error) {
      console.error("Error getting horoscope:", error);
      toast({
        variant: "destructive",
        title: "Aiyo, Oru prashnam!",
        description: "Something went wrong while reading the stars. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim() || !horoscope) return;

    const userMessage: Message = { role: 'user', text: followUp };
    setConversation(prev => [...prev, userMessage]);
    setFollowUp("");
    setIsAnswering(true);

    try {
      const { roast } = await roastFollowUp({ horoscopePrediction: horoscope.prediction, followUpQuestion: followUp });
      const botMessage: Message = { role: 'bot', text: roast };
      setConversation(prev => [...prev, botMessage]);

    } catch (error) {
       console.error("Error getting roast:", error);
       const botMessage: Message = { role: 'bot', text: "Aiyo, my brain is fried. Ask later." };
       setConversation(prev => [...prev, botMessage]);
    } finally {
        setIsAnswering(false);
    }
  }

  if (apiKeyMissing) {
    return (
       <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground font-body">
         <main className="flex-1 flex items-center justify-center p-4 md:p-6">
            <Alert variant="destructive" className="max-w-md">
                <KeyRound />
                <AlertTitle>API Key Missing</AlertTitle>
                <AlertDescription>
                   The <code className="font-mono bg-destructive-foreground/20 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is missing. Please add it to the <code className="font-mono bg-destructive-foreground/20 px-1 py-0.5 rounded">.env</code> file to continue.
                </AlertDescription>
            </Alert>
         </main>
       </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground font-body">
      <header className="p-4 border-b border-border/20 shadow-lg bg-black/30 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <Sparkles className="text-primary" />
          <h1 className="text-3xl font-bold font-headline text-center text-primary-foreground tracking-wider">
            Mystic Astrologer
          </h1>
          <Sparkles className="text-primary" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col items-center space-y-4">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Tell Me Your Details</CardTitle>
                <CardDescription>Let the cosmos reveal its secrets... maybe.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                 <div className="w-full space-y-2">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                    </div>
                    <Select onValueChange={setGender} value={gender}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-3">
                           <VenetianMask className="h-4 w-4 text-muted-foreground" />
                           <SelectValue placeholder="Select Gender" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                 </div>
                <Button
                  onClick={handleGetHoroscope}
                  disabled={isLoading || !date || !name || !gender}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Consulting the stars...
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-5 w-5" />
                      Get My Horoscope
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col h-full">
            {horoscope && (
              <Card className="w-full max-w-md h-full flex flex-col bg-card/50 backdrop-blur-lg border-primary/20 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <Sparkles className="h-6 w-6 text-accent"/>
                         <CardTitle className="text-2xl font-headline">{horoscope.title}</CardTitle>
                    </div>
                  <CardDescription>Here is what the stars... I think... are telling me.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <Separator className="my-4 bg-primary/20"/>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed font-serif">{horoscope.prediction}</p>
                   <Separator className="my-4 bg-primary/20"/>
                   <div className="flex-1 flex flex-col justify-end mt-4 space-y-4">
                     <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                        {conversation.map((msg, index) => (
                            <div key={index} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn("rounded-lg px-4 py-2 max-w-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isAnswering && (
                            <div className="flex justify-start">
                                <div className="rounded-lg px-4 py-2 max-w-sm bg-secondary text-secondary-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                </div>
                            </div>
                        )}
                        </div>
                     </ScrollArea>
                      <form onSubmit={handleFollowUp} className="flex gap-2 pt-2">
                        <Input 
                            value={followUp} 
                            onChange={(e) => setFollowUp(e.target.value)} 
                            placeholder="Question your fate..."
                            disabled={isAnswering}
                        />
                        <Button type="submit" size="icon" disabled={isAnswering || !followUp.trim()}>
                           {isAnswering ? <Loader2 className="animate-spin"/> : <Send />}
                        </Button>
                      </form>
                   </div>
                </CardContent>
              </Card>
            )}
             {!horoscope && !isLoading && (
                 <div className="text-center text-slate-400 p-8">
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-20"/>
                    <h2 className="text-xl font-headline">Your future awaits.</h2>
                    <p>Provide your details to begin.</p>
                 </div>
             )}
              {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin opacity-50"/>
                    <h2 className="text-xl font-headline">Shhh, the cosmos is whispering...</h2>
                    <p>Or maybe it's just solar wind. I'm not sure.</p>
                 </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

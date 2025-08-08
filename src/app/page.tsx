"use client";

import { useState } from "react";
import { getHoroscope } from "@/ai/flows/get-horoscope-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Star, AlertTriangle, Loader2, KeyRound, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Horoscope = {
  title: string;
  prediction: string;
};

const apiKeyMissing = !process.env.NEXT_PUBLIC_GEMINI_API_KEY_CHECK;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const { toast } = useToast();

  const handleGetHoroscope = async () => {
    if (!date) {
        toast({
            variant: "destructive",
            title: "No Date Selected",
            description: "Please select your date of birth.",
        });
        return;
    }

    setIsLoading(true);
    setHoroscope(null);

    try {
      // Format date to YYYY-MM-DD
      const dateOfBirth = format(date, "yyyy-MM-dd");
      const { title, prediction } = await getHoroscope({ dateOfBirth });
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
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center space-y-4">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Tell Me Your Birth Date</CardTitle>
                <CardDescription>Let the cosmos reveal its secrets...</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
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

                <Button
                  onClick={handleGetHoroscope}
                  disabled={isLoading || !date}
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

          <div className="flex items-center justify-center">
            {horoscope && (
              <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <Sparkles className="h-6 w-6 text-accent"/>
                         <CardTitle className="text-2xl font-headline">{horoscope.title}</CardTitle>
                    </div>
                  <CardDescription>Here is what the stars... I think... are telling me.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="my-4 bg-primary/20"/>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed font-serif">{horoscope.prediction}</p>
                </CardContent>
              </Card>
            )}
             {!horoscope && !isLoading && (
                 <div className="text-center text-slate-400 p-8">
                    <Star className="h-16 w-16 mx-auto mb-4 opacity-20"/>
                    <h2 className="text-xl font-headline">Your future awaits.</h2>
                    <p>Select your birth date to begin.</p>
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

"use client";

import { useState, useRef, useEffect } from "react";
import { readPalm } from "@/ai/flows/read-palm-flow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Sparkles, Hand, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type Horoscope = {
  title: string;
  prediction: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings to use this app.",
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleReadPalm = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setHoroscope(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) {
        toast({ variant: "destructive", title: "Error", description: "Could not get canvas context." });
        setIsLoading(false);
        return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUri = canvas.toDataURL("image/jpeg");

    try {
      const { title, prediction } = await readPalm({ photoDataUri });
      setHoroscope({ title, prediction });
    } catch (error) {
      console.error("Error reading palm:", error);
      toast({
        variant: "destructive",
        title: "Aiyo, Oru prashnam!",
        description: "Enikku onnum kaanan pattunilla. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground font-body">
      <header className="p-4 border-b border-border/20 shadow-lg bg-black/30 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
          <Sparkles className="text-primary" />
          <h1 className="text-3xl font-bold font-headline text-center text-primary-foreground tracking-wider">
            Mystic Palm Reader
          </h1>
          <Sparkles className="text-primary" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center space-y-4">
            <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Show Me Your Palm</CardTitle>
                <CardDescription>Let fate reveal its secrets...</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="w-full aspect-video rounded-lg bg-slate-900/50 border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden">
                   {hasCameraPermission === null && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
                   {hasCameraPermission === false && (
                     <div className="text-center text-destructive p-4">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p>Camera access is required.</p>
                        <p className="text-xs text-muted-foreground">Please enable it in your browser settings.</p>
                     </div>
                   )}
                   {hasCameraPermission === true && <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />}
                </div>
                 <canvas ref={canvasRef} className="hidden" />
                <Button
                  onClick={handleReadPalm}
                  disabled={isLoading || !hasCameraPermission}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Peeking into your future...
                    </>
                  ) : (
                    <>
                      <Hand className="mr-2 h-5 w-5" />
                      Read My Palm
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
                  <CardDescription>Here is what the lines... I think... are telling me.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="my-4 bg-primary/20"/>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed font-serif">{horoscope.prediction}</p>
                </CardContent>
              </Card>
            )}
             {!horoscope && !isLoading && (
                 <div className="text-center text-slate-400 p-8">
                    <Hand className="h-16 w-16 mx-auto mb-4 opacity-20"/>
                    <h2 className="text-xl font-headline">Your future awaits.</h2>
                    <p>Present your palm to the camera to begin.</p>
                 </div>
             )}
              {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center text-slate-400 p-8">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin opacity-50"/>
                    <h2 className="text-xl font-headline">Shhh, the spirits are talking...</h2>
                    <p>Or maybe it's just the wind. I'm not sure.</p>
                 </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}

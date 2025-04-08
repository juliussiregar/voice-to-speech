import { useState } from "react";
import TextInput from "@/components/TextInput";
import OptionsSelect from "@/components/OptionsSelect";
import ActionButton from "@/components/ActionButton";
import AudioPlayer from "@/components/AudioPlayer";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [text, setText] = useState("");
  const [voiceType, setVoiceType] = useState("female-standard");
  const [speechSpeed, setSpeechSpeed] = useState("1.0");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const convertMutation = useMutation({
    mutationFn: async ({ text, voiceType, speechSpeed }: { 
      text: string; 
      voiceType: string; 
      speechSpeed: string;
    }) => {
      const response = await apiRequest("POST", "/api/tts/convert", {
        text,
        voiceType,
        speechSpeed: parseFloat(speechSpeed)
      });
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setAudioUrl(data.audioUrl);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert text to speech. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleConvert = () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some Indonesian text to convert.",
        variant: "destructive"
      });
      return;
    }

    convertMutation.mutate({ text, voiceType, speechSpeed });
  };

  const handleClearText = () => {
    setText("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="font-bold text-3xl md:text-4xl text-primary mb-2">
          Indonesian Text to Speech
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Convert your Indonesian text to natural-sounding female voice audio.
        </p>
      </header>

      <main className="bg-white rounded-lg shadow-md p-6">
        <TextInput 
          text={text} 
          setText={setText} 
          onClear={handleClearText} 
        />
        
        <OptionsSelect 
          voiceType={voiceType} 
          setVoiceType={setVoiceType}
          speechSpeed={speechSpeed}
          setSpeechSpeed={setSpeechSpeed}
        />
        
        <ActionButton 
          onClick={handleConvert} 
          isLoading={convertMutation.isPending} 
        />
        
        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} />
        )}
      </main>

      <Footer />
    </div>
  );
}

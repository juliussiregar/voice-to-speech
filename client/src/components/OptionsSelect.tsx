import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface OptionsSelectProps {
  voiceType: string;
  setVoiceType: (value: string) => void;
  speechSpeed: string;
  setSpeechSpeed: (value: string) => void;
}

export default function OptionsSelect({ 
  voiceType, 
  setVoiceType, 
  speechSpeed, 
  setSpeechSpeed 
}: OptionsSelectProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="voice-select" className="block text-sm font-medium mb-1">Voice</Label>
          <Select 
            value={voiceType} 
            onValueChange={setVoiceType}
          >
            <SelectTrigger id="voice-select" className="w-full p-3">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female-standard">Indonesian Female (Standard)</SelectItem>
              <SelectItem value="female-casual">Indonesian Female (Casual)</SelectItem>
              <SelectItem value="female-formal">Indonesian Female (Formal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="speed-select" className="block text-sm font-medium mb-1">Speaking Speed</Label>
          <Select 
            value={speechSpeed} 
            onValueChange={setSpeechSpeed}
          >
            <SelectTrigger id="speed-select" className="w-full p-3">
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.8">Slow</SelectItem>
              <SelectItem value="1.0">Normal</SelectItem>
              <SelectItem value="1.2">Fast</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

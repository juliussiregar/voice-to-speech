import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  onClear: () => void;
}

export default function TextInput({ text, setText, onClear }: TextInputProps) {
  const characterLimit = 5000;
  const characterCount = text.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="text-input" className="font-nunito font-semibold text-lg">
          Input Text (Indonesian)
        </label>
        <div className="text-sm text-gray-500">
          <span>{characterCount}</span>/{characterLimit} characters
        </div>
      </div>
      
      <textarea 
        id="text-input" 
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
        placeholder="Ketik atau tempel teks Bahasa Indonesia di sini..."
        rows={8}
        maxLength={characterLimit}
        value={text}
        onChange={handleChange}
      />

      <div className="flex justify-end mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-gray-500 hover:text-primary text-sm transition"
        >
          <X className="h-4 w-4 mr-1" /> Clear text
        </Button>
      </div>
    </div>
  );
}

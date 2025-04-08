import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function ActionButton({ onClick, isLoading }: ActionButtonProps) {
  return (
    <div className="mb-8 text-center">
      <Button 
        onClick={onClick} 
        disabled={isLoading}
        className="bg-primary hover:bg-blue-600 text-white font-nunito font-semibold py-3 px-8 rounded-lg transition shadow-md w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" />
            Convert to Speech
          </>
        )}
      </Button>
    </div>
  );
}

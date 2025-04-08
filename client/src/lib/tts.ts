import { apiRequest } from "./queryClient";

export interface TTSOptions {
  text: string;
  voiceType: string;
  speechSpeed: number;
}

export async function convertTextToSpeech(options: TTSOptions): Promise<{ audioUrl: string }> {
  const response = await apiRequest("POST", "/api/tts/convert", options);
  return response.json();
}

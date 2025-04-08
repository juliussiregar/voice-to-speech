import { TtsRequest } from "@shared/schema";
import fs from "fs";
import path from "path";
import util from "util";
import crypto from "crypto";
import { exec } from "child_process";

// A simple in-memory audio file storage (in production, use cloud storage)
const audioFilesDir = path.join(process.cwd(), 'dist', 'audio-files');
const sampleMp3Path = path.join(process.cwd(), 'sample.mp3');

// Ensure the directory exists
if (!fs.existsSync(audioFilesDir)) {
  fs.mkdirSync(audioFilesDir, { recursive: true });
}

/**
 * Promisified exec function
 */
const execPromise = util.promisify(exec);

/**
 * Text-to-Speech service that converts text to audio using Google Cloud TTS
 */
export class TTSService {
  private writeFileAsync = util.promisify(fs.writeFile);
  
  /**
   * Convert text to speech and return the URL to the audio file
   */
  async convertTextToSpeech(request: TtsRequest): Promise<string> {
    try {
      // Generate a unique filename based on the request
      const hash = crypto.createHash('md5').update(
        `${request.text}-${request.voiceType}-${request.speechSpeed}`
      ).digest('hex');
      
      const filename = `${hash}.mp3`;
      const filePath = path.join(audioFilesDir, filename);
      
      // Check if we already have this audio file to avoid regenerating it
      if (!fs.existsSync(filePath)) {
        try {
          // Check if Google Application Credentials are available
          if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
          }

          // Read the credentials file
          const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
          const credentialsData = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
          
          // Extract project ID
          const projectId = credentialsData.project_id;
          
          // Get access token from credentials
          const tokenUrl = 'https://oauth2.googleapis.com/token';
          const tokenPayload = {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: this.createJWT(credentialsData)
          };
          
          const tokenResponse = await axios.post(tokenUrl, new URLSearchParams(tokenPayload));
          const accessToken = tokenResponse.data.access_token;
          
          // Call the Google Cloud TTS API
          const response = await axios.post(
            'https://texttospeech.googleapis.com/v1/text:synthesize',
            {
              input: {
                text: request.text
              },
              voice: {
                languageCode: 'id-ID',
                // Map the voiceType to an appropriate Google Cloud TTS voice
                name: this.getGoogleTTSVoice(request.voiceType)
              },
              audioConfig: {
                audioEncoding: 'MP3',
                // Adjust the speaking rate based on speechSpeed
                speakingRate: this.getSpeakingRate(request.speechSpeed)
              }
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-User-Project': projectId,
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          
          // The API returns audio content as a base64 encoded string
          const audioContent = response.data.audioContent;
          if (audioContent) {
            // Convert base64 to binary and save to file
            const audioBuffer = Buffer.from(audioContent, 'base64');
            await this.writeFileAsync(filePath, audioBuffer);
            console.log(`Generated audio file saved to ${filePath}`);
          } else {
            throw new Error('No audio content returned from Google TTS API');
          }
        } catch (apiError) {
          console.error('Google TTS API error:', apiError);
          console.log('Falling back to sample audio file');
          
          // Fallback to sample audio if API call fails
          if (fs.existsSync(sampleMp3Path)) {
            fs.copyFileSync(sampleMp3Path, filePath);
          } else {
            console.warn('Sample MP3 file not found, creating empty file');
            const dummyBuffer = Buffer.alloc(1024);
            await this.writeFileAsync(filePath, dummyBuffer);
          }
        }
      }
      
      // Return the URL to the audio file
      return `/api/tts/audio/${filename}`;
    } catch (error) {
      console.error('TTS conversion error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }
  
  /**
   * Map the voiceType to an appropriate Google Cloud TTS voice
   */
  private getGoogleTTSVoice(voiceType: string): string {
    // Map the voiceType to a Google Cloud TTS voice name
    // Default to a high-quality female Indonesian voice
    switch (voiceType) {
      case 'female-1':
        return 'id-ID-Standard-A'; // Standard female voice 1
      case 'female-2':
        return 'id-ID-Wavenet-A';  // WaveNet female voice
      case 'female-3':
        return 'id-ID-Chirp3-HD-Leda';  // Neural2 female voice (HD)
      case 'male-1':
        return 'id-ID-Standard-B'; // Standard male voice
      case 'male-2':
        return 'id-ID-Wavenet-B';  // WaveNet male voice
      default:
        return 'id-ID-Chirp3-HD-Leda';  // Default to female HD voice
    }
  }
  
  /**
   * Get the speaking rate based on speechSpeed
   */
  private getSpeakingRate(speechSpeed: number): number {
    // Map the speechSpeed to a Google Cloud TTS speaking rate
    // 1.0 is normal speed, 0.5 is half speed, 2.0 is double speed
    return speechSpeed;
  }
  
  /**
   * Get the path to an audio file by filename
   */
  getAudioFilePath(filename: string): string {
    return path.join(audioFilesDir, filename);
  }
}

export const ttsService = new TTSService();

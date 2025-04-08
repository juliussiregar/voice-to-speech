import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ttsRequestSchema, insertTtsConversionSchema } from "@shared/schema";
import { ttsService } from "./services/tts-service";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API routes
  const apiRouter = express.Router();
  
  // Text-to-Speech conversion endpoint
  apiRouter.post("/tts/convert", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = ttsRequestSchema.parse(req.body);
      
      // Convert text to speech
      const audioUrl = await ttsService.convertTextToSpeech(validatedData);
      
      // Save the conversion to storage
      await storage.saveTtsConversion({
        text: validatedData.text,
        voiceType: validatedData.voiceType,
        speechSpeed: validatedData.speechSpeed,
        audioUrl: audioUrl
      });
      
      // Return the audio file URL
      res.json({ audioUrl });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("TTS conversion error:", error);
        res.status(500).json({ message: "Failed to convert text to speech" });
      }
    }
  });
  
  // Serve audio files
  apiRouter.get("/tts/audio/:filename", (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const filePath = ttsService.getAudioFilePath(filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      
      // Set appropriate headers and serve the file
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      console.error("Error serving audio file:", error);
      res.status(500).json({ message: "Failed to serve audio file" });
    }
  });

  // Mount API routes with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

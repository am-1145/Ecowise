import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GeminiService, ICarbonStats } from '../services/geminiService';
import { MistralService } from '../services/mistralService';
import { TranslationService } from '../services/translationService';
import { Activity } from '../models/Activity';
import { ChatMessage } from '../models/ChatMessage';

export class ChatbotController {
  /**
   * Retrieve historical chat messages for the user
   */
  static async getHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const userId = req.user._id;

      const messages = await ChatMessage.find({ userId }).sort({ createdAt: 1 });
      return res.json({ messages });
    } catch (error) {
      console.error('[chatbotController.ts:getHistory] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve chat history.' });
    }
  }

  /**
   * Send chat dialogue to EcoBot
   */
  static async chat(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
      const { message, model = 'gemini', language = 'en' } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Chat message is required.' });
      }

      const userId = req.user._id;

      // Save user prompt (in original language) to MongoDB
      const userMsg = new ChatMessage({
        userId,
        role: 'user',
        parts: message
      });
      await userMsg.save();

      // Retrieve recent conversation history context (limit to last 20 messages for prompt efficiency)
      const dbHistory = await ChatMessage.find({ userId }).sort({ createdAt: 1 }).limit(20);
      
      // We translate the history messages back to English for the LLM to maintain consistent context
      const historyFormatted = await Promise.all(
        dbHistory.slice(0, -1).map(async (msg) => {
          let englishParts = msg.parts;
          if (language !== 'en') {
            englishParts = await TranslationService.translate(msg.parts, 'en');
          }
          return {
            role: msg.role,
            parts: englishParts
          };
        })
      );

      // Fetch user carbon logs to provide contextual AI replies
      const logs = await Activity.find({ userId }).sort({ date: -1 }).limit(7);
      let stats: ICarbonStats | undefined;

      if (logs.length > 0) {
        const sum = logs.reduce((acc, log) => acc + log.totalCarbonImpact, 0);
        const count = logs.length;
        stats = {
          transportation: Math.round((sum * 0.35) / count),
          energy: Math.round((sum * 0.3) / count),
          food: Math.round((sum * 0.2) / count),
          shopping: Math.round((sum * 0.1) / count),
          waste: Math.round((sum * 0.04) / count),
          water: Math.round((sum * 0.01) / count),
          total: Math.round(sum / count)
        };
      }

      // Translate the current user message to English before sending to the selected AI model
      let englishMessage = message;
      if (language !== 'en') {
        englishMessage = await TranslationService.translate(message, 'en');
      }

      let replyEnglish = '';
      if (model === 'mistral') {
        replyEnglish = await MistralService.chat(englishMessage, historyFormatted, stats);
      } else {
        replyEnglish = await GeminiService.chat(englishMessage, historyFormatted, stats);
      }

      // Translate the English response back to the user's selected language
      let reply = replyEnglish;
      if (language !== 'en') {
        reply = await TranslationService.translate(replyEnglish, language);
      }

      // Save model reply (in translated language) to MongoDB
      const modelMsg = new ChatMessage({
        userId,
        role: 'model',
        parts: reply
      });
      await modelMsg.save();

      return res.json({ reply });
    } catch (error) {
      console.error('[chatbotController.ts:chat] Error:', error);
      return res.status(500).json({ error: 'Failed to retrieve chatbot response.' });
    }
  }

  /**
   * Generate Custom Learning Paths
   */
  static async getLearningPath(req: AuthRequest, res: Response) {
    try {
      const { topic } = req.query;
      if (!topic) {
        return res.status(400).json({ error: 'Topic query parameter is required.' });
      }

      const path = await GeminiService.generateLearningPath(topic as string);
      return res.json({ topic, path });
    } catch (error) {
      console.error('[chatbotController.ts:getLearningPath] Error:', error);
      return res.status(500).json({ error: 'Failed to generate custom learning roadmap.' });
    }
  }
}

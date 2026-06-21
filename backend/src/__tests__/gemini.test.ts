/// <reference types="jest" />

import { describe, it, expect, jest } from '@jest/globals';
import { GeminiService, ICarbonStats } from '../services/geminiService';

// Ensure GEMINI_API_KEY is not set to run in mock mode
process.env.GEMINI_API_KEY = '';

describe('GeminiService Tests (Mock Fallback)', () => {
  describe('chat', () => {
    it('should return welcome message for hello input', async () => {
      const response = await GeminiService.chat('hello', []);
      expect(response).toContain('EcoBot');
      expect(response).toContain('sustainability coach');
    });

    it('should return default coaching advice if no userStats are provided', async () => {
      const response = await GeminiService.chat('how to reduce carbon footprint?', []);
      expect(response).toContain('Transit');
      expect(response).toContain('Diet');
      expect(response).toContain('Power');
    });

    it('should return personalized insights identifying energy as highest contributor', async () => {
      const stats: ICarbonStats = {
        transportation: 120,
        energy: 450, // highest
        food: 80,
        shopping: 50,
        waste: 20,
        water: 15,
        total: 735
      };

      const response = await GeminiService.chat('reduce carbon footprint', [], stats);
      expect(response).toContain('ENERGY');
      expect(response).toContain('450 kg CO₂');
      expect(response).toContain('largest contributor');
    });

    it('should return score information when requested', async () => {
      const response = await GeminiService.chat('how is my score calculated?', []);
      expect(response).toContain('sustainability score');
      expect(response).toContain('Dashboard');
    });

    it('should return default fallback answer for general questions', async () => {
      const response = await GeminiService.chat('tell me about recycling plastics', []);
      expect(response).toContain('daily habits');
      expect(response).toContain('recycling');
    });
  });

  describe('generateWeeklyPlan', () => {
    it('should return a JSON string of 3 plan items', async () => {
      const stats: ICarbonStats = {
        transportation: 100,
        energy: 100,
        food: 100,
        shopping: 100,
        waste: 100,
        water: 100,
        total: 600
      };

      const planJson = await GeminiService.generateWeeklyPlan(stats);
      const plan = JSON.parse(planJson);
      
      expect(Array.isArray(plan)).toBe(true);
      expect(plan.length).toBe(3);
      expect(plan[0]).toHaveProperty('title');
      expect(plan[0]).toHaveProperty('description');
      expect(plan[0]).toHaveProperty('estimatedSavings');
    });
  });

  describe('generateLearningPath', () => {
    it('should return a 4-step progressive learning path for the specified topic', async () => {
      const path = await GeminiService.generateLearningPath('composting');
      
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBe(4);
      expect(path[0].step).toBe(1);
      expect(path[0].title).toContain('composting');
      expect(path[1].step).toBe(2);
      expect(path[2].step).toBe(3);
      expect(path[3].step).toBe(4);
    });
  });
});

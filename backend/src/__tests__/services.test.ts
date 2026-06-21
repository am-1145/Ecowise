/// <reference types="jest" />

import { describe, it, expect, jest } from '@jest/globals';
import axios from 'axios';

// Mock axios globally to throw an error to force fallback mock mode in unit tests
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation(() => Promise.reject(new Error('API request disabled in unit tests'))),
  get: jest.fn().mockImplementation(() => Promise.reject(new Error('API request disabled in unit tests')))
}));

// Reset env vars and module registry so that services execute their module scope with empty keys
process.env.GOOGLE_TRANSLATE_API_KEY = '';
process.env.MISTRAL_API_KEY = '';

jest.resetModules();

const { TranslationService } = require('../services/translationService');
const { MistralService } = require('../services/mistralService');

describe('TranslationService Tests', () => {
  it('should return original text if target language is English', async () => {
    const text = 'Hello, this is a test';
    const result = await TranslationService.translate(text, 'en');
    expect(result).toBe(text);
  });

  it('should return mock translated text for supported words in Spanish', async () => {
    const text = 'hello ecobot';
    const result = await TranslationService.translate(text, 'es');
    expect(result.toLowerCase()).toContain('¡hola!');
    expect(result.toLowerCase()).toContain('ecobot');
  });

  it('should return text with [LANG] prefix if phrase is not in the dictionary', async () => {
    const text = 'random sentence here';
    const result = await TranslationService.translate(text, 'fr');
    expect(result).toBe('[FR] random sentence here');
  });
});

describe('MistralService Tests', () => {
  it('should fall back to mock response and state it is in Mock Mode', async () => {
    const result = await MistralService.chat('how to reduce carbon footprint?', [], {
      transportation: 10,
      energy: 10,
      food: 10,
      shopping: 10,
      waste: 10,
      water: 10,
      total: 60
    });
    expect(result).toContain('[Mistral AI - Mock Mode]');
    expect(result).toContain('Transportation');
    expect(result).toContain('Energy');
  });
});

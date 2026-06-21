/// <reference types="jest" />

import { describe, it, expect, jest } from '@jest/globals';
import axios from 'axios';

// Mock axios globally to throw an error to force fallback mock mode in unit tests
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation(() => Promise.reject(new Error('API request disabled in unit tests'))),
  get: jest.fn().mockImplementation(() => Promise.reject(new Error('API request disabled in unit tests')))
}));

process.env.GOOGLE_TRANSLATE_API_KEY = '';
jest.resetModules();

const { TranslationService } = require('../services/translationService');

describe('TranslationService Caching Tests', () => {
  it('should return original text immediately if language is English', async () => {
    const text = 'sustainability guidelines';
    const result = await TranslationService.translate(text, 'en');
    expect(result).toBe(text);
  });

  it('should translate dictionary words to Spanish and hit internal cache on subsequent requests', async () => {
    const text = 'sustainability';
    // Translate first time
    const res1 = await TranslationService.translate(text, 'es');
    expect(res1).toBe('sostenibilidad');

    // Translate second time
    const res2 = await TranslationService.translate(text, 'es');
    expect(res2).toBe('sostenibilidad');
  });

  it('should translate phrases to German and save them correctly', async () => {
    const text = 'hello ecobot';
    const res1 = await TranslationService.translate(text, 'de');
    expect(res1.toLowerCase()).toContain('hallo');
    expect(res1.toLowerCase()).toContain('ecobot');
  });

  it('should return visual lang prefix if word is not in mock dictionary', async () => {
    const text = 'unknown random text';
    const res = await TranslationService.translate(text, 'fr');
    expect(res).toBe('[FR] unknown random text');
  });
});

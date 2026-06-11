import { TranslationService } from '../services/translationService';
import { MistralService } from '../services/mistralService';

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

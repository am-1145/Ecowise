import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

// High fidelity dictionary for fallback translations during mock testing
const fallbackDicts: Record<string, Record<string, string>> = {
  es: {
    "hello": "¡Hola!",
    "hi": "¡Hola!",
    "ecobot": "EcoBot",
    "carbon footprint": "huella de carbono",
    "sustainability": "sostenibilidad",
    "reduce": "reducir",
    "energy": "energía",
    "transportation": "transporte",
    "food": "comida",
    "waste": "residuos",
    "water": "agua",
    "shopping": "compras"
  },
  fr: {
    "hello": "Bonjour !",
    "hi": "Salut !",
    "ecobot": "EcoBot",
    "carbon footprint": "empreinte carbone",
    "sustainability": "durabilité",
    "reduce": "réduire",
    "energy": "énergie",
    "transportation": "transport",
    "food": "alimentation",
    "waste": "déchets",
    "water": "eau",
    "shopping": "achats"
  },
  de: {
    "hello": "Hallo!",
    "hi": "Hi!",
    "ecobot": "EcoBot",
    "carbon footprint": "CO2-Fußabdruck",
    "sustainability": "Nachhaltigkeit",
    "reduce": "reduzieren",
    "energy": "Energie",
    "transportation": "Verkehr",
    "food": "Ernährung",
    "waste": "Abfall",
    "water": "Wasser",
    "shopping": "Einkaufen"
  },
  hi: {
    "hello": "नमस्ते!",
    "hi": "नमस्ते!",
    "ecobot": "इकोबॉट",
    "carbon footprint": "कार्बन फुटप्रिंट",
    "sustainability": "सतत विकास",
    "reduce": "कम करना",
    "energy": "ऊर्जा",
    "transportation": "परिवहन",
    "food": "भोजन",
    "waste": "कचरा",
    "water": "पानी",
    "shopping": "खरीदारी"
  },
  ar: {
    "hello": "مرحباً!",
    "hi": "أهلاً!",
    "ecobot": "إيكوبوت",
    "carbon footprint": "البصمة الكربونية",
    "sustainability": "الاستدامة",
    "reduce": "تقليل",
    "energy": "الطاقة",
    "transportation": "المواصلات",
    "food": "الغذاء",
    "waste": "النفايات",
    "water": "المياه",
    "shopping": "التسوق"
  },
  zh: {
    "hello": "你好！",
    "hi": "你好！",
    "ecobot": "EcoBot",
    "carbon footprint": "碳足迹",
    "sustainability": "可持续发展",
    "reduce": "减少",
    "energy": "能源",
    "transportation": "交通",
    "food": "食物",
    "waste": "垃圾",
    "water": "水",
    "shopping": "购物"
  }
};

export class TranslationService {
  /**
   * Translates text to target language
   */
  static async translate(text: string, targetLang: string): Promise<string> {
    if (!text || !targetLang || targetLang.toLowerCase() === 'en') {
      return text;
    }

    // Google Translation API Key check
    if (apiKey) {
      try {
        const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
        const response = await axios.post(url, {
          q: [text],
          target: targetLang
        });

        if (response.data?.data?.translations?.[0]?.translatedText) {
          // Decode HTML entities if returned by Google Translate
          let translatedText = response.data.data.translations[0].translatedText;
          translatedText = translatedText
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          return translatedText;
        }
      } catch (error: any) {
        console.error('[TranslationService] Google Translate API error:', error?.response?.data || error.message);
      }
    }

    // High fidelity mock translation fallback
    const lang = targetLang.substring(0, 2).toLowerCase();
    const dict = fallbackDicts[lang];
    if (dict) {
      let mockText = text;
      // Simple word-by-word/phrase replacement for demo purposes if no key
      for (const [key, value] of Object.entries(dict)) {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        mockText = mockText.replace(regex, value);
      }
      // If no translation happened and we are demoing, add a visual indicator
      if (mockText === text) {
        return `[${targetLang.toUpperCase()}] ${text}`;
      }
      return mockText;
    }

    // If all else fails, return the original text
    return `[${targetLang.toUpperCase()}] ${text}`;
  }
}

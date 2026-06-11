import axios from 'axios';
import dotenv from 'dotenv';
import { ICarbonStats } from './geminiService';

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

export class MistralService {
  /**
   * Chat with Mistral AI Model
   */
  static async chat(message: string, history: { role: 'user' | 'model'; parts: string }[], userStats?: ICarbonStats): Promise<string> {
    if (!apiKey) {
      console.warn('MISTRAL_API_KEY is not defined. Falling back to mock Mistral response.');
      return this.getMockMistralResponse(message, userStats);
    }

    const systemPrompt = `You are EcoBot, the advanced AI Sustainability and Carbon Footprint assistant for EcoWise AI.
Your goal is to guide users to reduce their carbon footprint.
${userStats ? `The user's current carbon footprint stats (kg CO2/month) are: Transportation: ${userStats.transportation}, Energy: ${userStats.energy}, Food: ${userStats.food}, Shopping: ${userStats.shopping}, Waste: ${userStats.waste}, Water: ${userStats.water}. Total: ${userStats.total}.` : ''}
Keep responses helpful, actionable, and visually clean (use bolding and lists). Limit responses to 200 words.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts
      })),
      { role: 'user', content: message }
    ];

    try {
      const response = await axios.post('https://api.mistral.ai/v1/chat/completions', {
        model: 'mistral-tiny', // fast, cheap, standard model
        messages: messages,
        max_tokens: 350,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      }
      throw new Error('Invalid response structure from Mistral API');
    } catch (error: any) {
      console.error('[MistralService] Mistral API chat error:', error?.response?.data || error.message);
      // Fallback response rather than crashing the chat session
      return `[Mistral API Error - Falling back to local helper] I received your message: "${message}". 
Unfortunately, there was an issue communicating with the Mistral API. Please check your **MISTRAL_API_KEY** in the backend configuration.
Meanwhile, remember that reducing transportation and heating emissions is the fastest way to shrink your carbon footprint!`;
    }
  }

  /**
   * Mock Mistral response for testing when API key is missing
   */
  private static getMockMistralResponse(message: string, userStats?: ICarbonStats): string {
    const msgLower = message.toLowerCase();
    let statsOverview = '';
    if (userStats) {
      statsOverview = `Looking at your stats (Total: **${userStats.total} kg CO₂/month**), your main carbon drivers are Transportation (${userStats.transportation} kg) and Energy (${userStats.energy} kg).`;
    }

    if (msgLower.includes('reduce') || msgLower.includes('emission') || msgLower.includes('footprint') || msgLower.includes('how')) {
      return `[Mistral AI - Mock Mode]
${statsOverview}
To optimize your environmental impact:
- **Energy Efficiency**: Unplug phantom loads and switch to smart power strips.
- **Smart Commuting**: Carpool or transition to electric public transit options.
- **Dietary Adjustments**: Introduce 2 meat-free days per week.
Feel free to ask more details! (Add a valid **MISTRAL_API_KEY** to your backend environment to activate live responses).`;
    }

    return `[Mistral AI - Mock Mode]
Hello! I am EcoBot powered by **Mistral AI**. I help track carbon emissions and suggest green habit updates.
${statsOverview}
What can I do for you today? (Please set **MISTRAL_API_KEY** in your backend \`.env\` for live AI chat).`;
  }
}

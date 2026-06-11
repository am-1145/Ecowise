import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiModel: any = null;

if (apiKey) {
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    aiModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Failed to initialize Gemini API Client. Running in Mock Mode.', error);
  }
} else {
  console.log('No GEMINI_API_KEY found. EcoWise AI running in Mock AI Mode.');
}

// Interface for activity stats to feed to AI
export interface ICarbonStats {
  transportation: number;
  energy: number;
  food: number;
  shopping: number;
  waste: number;
  water: number;
  total: number;
}

export class GeminiService {
  /**
   * Chat with EcoBot
   */
  static async chat(message: string, history: { role: 'user' | 'model'; parts: string }[], userStats?: ICarbonStats): Promise<string> {
    if (aiModel) {
      try {
        const systemPrompt = `You are EcoBot, the advanced AI Sustainability and Carbon Footprint assistant for EcoWise AI.
        Your goal is to guide users to reduce their carbon footprint.
        ${userStats ? `The user's current carbon footprint stats (kg CO2/month) are: Transportation: ${userStats.transportation}, Energy: ${userStats.energy}, Food: ${userStats.food}, Shopping: ${userStats.shopping}, Waste: ${userStats.waste}, Water: ${userStats.water}. Total: ${userStats.total}.` : ''}
        Keep responses helpful, actionable, and visually clean (use bolding and lists). Limit responses to 200 words.`;

        const chatSession = aiModel.startChat({
          history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I will act as EcoBot and provide excellent sustainability guidance.' }] },
            ...history.map(h => ({ role: h.role, parts: [{ text: h.parts }] }))
          ]
        });

        const result = await chatSession.sendMessage(message);
        return result.response.text();
      } catch (error) {
        console.error('Gemini API chat error, falling back to mock response:', error);
      }
    }

    // Mock AI Responses
    const msgLower = message.toLowerCase();
    if (msgLower.includes('reduce') || msgLower.includes('emission') || msgLower.includes('footprint') || msgLower.includes('how')) {
      if (userStats) {
        const highest = Object.entries(userStats)
          .filter(([k]) => k !== 'total')
          .sort((a, b) => b[1] - a[1])[0];
        return `Based on your logs, your **${highest[0].toUpperCase()}** carbon footprint is your largest contributor (${highest[1]} kg CO₂).
- For transportation: Try replacing 2 car trips per week with metro or bike rides to save up to **15%** of your weekly footprint.
- For energy: Switching off standby appliances can reduce annual household carbon output by **120kg CO₂**.
- Let me know if you would like me to set up an action goal for this!`;
      }
      return `To reduce your carbon footprint effectively, focus on these top 3 areas:
1. **Transit**: Carpool or use electric public transit. Walking/biking has zero emissions.
2. **Diet**: Reduce red meat intake. Vegetarian/vegan meals emit up to 60% less CO₂.
3. **Power**: Upgrade to LED lights and install smart thermostats to optimize AC usage.`;
    }

    if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
      return `Hello! I am **EcoBot**, your sustainability coach. I can help you analyze your carbon emissions, build personal reduction roadmaps, and answer green questions. What can I help you with today?`;
    }

    if (msgLower.includes('calculate') || msgLower.includes('score') || msgLower.includes('grade')) {
      return `Your sustainability score represents your footprint compared to global climate-safe targets (e.g. keeping footprint below 2,000 kg CO₂/year). You can view your scorecard breakdown on the **Sustainability Dashboard** or log more activities to refine it.`;
    }

    return `That's an interesting question! Taking care of our planet starts with small daily habits. Adjusting your heating, purchasing local goods, and recycling plastic are excellent ways to lower your carbon impact. Let me know if you'd like an action plan for this!`;
  }

  /**
   * Generate Custom Weekly Sustainability Action Plan
   */
  static async generateWeeklyPlan(stats: ICarbonStats): Promise<string> {
    if (aiModel) {
      try {
        const prompt = `Generate a customized 3-item weekly action plan for a user based on their carbon profile:
        Transportation: ${stats.transportation} kg CO2
        Energy: ${stats.energy} kg CO2
        Food: ${stats.food} kg CO2
        Shopping: ${stats.shopping} kg CO2
        Waste: ${stats.waste} kg CO2
        Water: ${stats.water} kg CO2
        Total: ${stats.total} kg CO2.
        Return raw JSON containing an array of objects: [{ title, description, category, impact: 'high'|'medium'|'low', difficulty: 'easy'|'medium'|'hard', estimatedSavings: number, timeRequired: string }]. Respond only with JSON.`;

        const result = await aiModel.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return jsonMatch[0];
        }
      } catch (error) {
        console.error('Gemini generateWeeklyPlan error:', error);
      }
    }

    // High fidelity mock fallback
    const plans = [
      {
        title: "Go Meat-Free for 3 Days",
        description: "Replace beef and pork meals with vegetarian/vegan options to save water and reduce greenhouse gas emissions.",
        category: "food",
        impact: "high",
        difficulty: "easy",
        estimatedSavings: 15,
        timeRequired: "3 days"
      },
      {
        title: "Transit Swap",
        description: "Swap 3 single-driver car commutes with public transit (bus/metro) or biking.",
        category: "transportation",
        impact: "high",
        difficulty: "medium",
        estimatedSavings: 28,
        timeRequired: "1 week"
      },
      {
        title: "Unplug Vampire Devices",
        description: "Unplug chargers, laptops, and consoles when not in use to curb energy leakages.",
        category: "energy",
        impact: "medium",
        difficulty: "easy",
        estimatedSavings: 8,
        timeRequired: "5 mins"
      }
    ];

    return JSON.stringify(plans);
  }

  /**
   * Generate educational path based on topics
   */
  static async generateLearningPath(topic: string): Promise<{ step: number; title: string; description: string }[]> {
    if (aiModel) {
      try {
        const prompt = `Create a 4-step progressive learning path for the topic: "${topic}".
        Return raw JSON format: [{"step": 1, "title": "...", "description": "..."}]. Keep responses concise.`;
        const result = await aiModel.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Gemini learning path error, falling back to mock:', e);
      }
    }

    return [
      { step: 1, title: `Understanding ${topic} Basics`, description: `Learn the fundamentals, core terminology, and global footprint indicators associated with ${topic}.` },
      { step: 2, title: `Identifying Personal Impact`, description: `Assess your household habits, daily consumption volumes, and hidden carbon inputs.` },
      { step: 3, title: `Practical Implementation`, description: `Apply direct, low-cost modifications to your schedule to reduce waste/emissions by 15%.` },
      { step: 4, title: `Advocacy & Long-term Scaling`, description: `Share best practices with family/teams, transition to smart providers, and track your metrics.` }
    ];
  }
}

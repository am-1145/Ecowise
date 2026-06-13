import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Bot, Send, Mic, Volume2, VolumeX, RefreshCw, Globe, Cpu } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

interface IMessage {
  role: 'user' | 'model';
  parts: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'zh-CN', name: '简体中文 (Chinese)' }
];

const WELCOME_MESSAGES: Record<string, string> = {
  en: 'Hello! I am EcoBot, your sustainability coaching assistant. How can I help you reduce your carbon footprint today?',
  es: '¡Hola! Soy EcoBot, tu asistente de entrenamiento en sostenibilidad. ¿Cómo puedo ayudarte a reducir tu huella de carbono hoy?',
  fr: 'Bonjour ! Je suis EcoBot, votre assistant de coaching en durabilité. Comment puis-je vous aider à réduire votre empreinte carbone aujourd\'hui ?',
  de: 'Hallo! Ich bin EcoBot, dein Coach für Nachhaltigkeit. Wie kann ich dir helfen, deinen CO2-Fußabdruck heute zu reduzieren?',
  hi: 'नमस्ते! मैं इकोबॉट हूँ, आपका स्थिरता कोचिंग सहायक। आज मैं आपके कार्बन फुटप्रिंट को कम करने में कैसे मदद कर सकता हूँ?',
  ar: 'مرحباً! أنا إيكوبوت، مساعدك الشخصي للاستدامة. كيف يمكنني مساعدتك في تقليل بصمتك الكربونية اليوم؟',
  'zh-CN': '你好！我是 EcoBot，您的可持续发展辅导助手。今天我该如何帮助您减少碳足迹？'
};

export const EcoBot: React.FC = () => {
  const { user } = useStore();
  const { speak, stopSpeaking } = useAccessibility();

  const [model, setModel] = useState<'gemini' | 'mistral'>('gemini');
  const [language, setLanguage] = useState<string>('en');
  const [messages, setMessages] = useState<IMessage[]>([
    { role: 'model', parts: WELCOME_MESSAGES['en'] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [listening, setListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/bot/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages.map((m: any) => ({
            role: m.role,
            parts: m.parts
          })));
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Update initial message when language changes, if no other messages are present
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      const welcome = WELCOME_MESSAGES[language] || WELCOME_MESSAGES['en'];
      setMessages([{ role: 'model', parts: welcome }]);
    }
  }, [language]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');
    const newMessages = [...messages, { role: 'user' as const, parts: messageText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/bot/chat`, {
        message: messageText,
        history: newMessages.slice(0, -1), // exclude current
        model,
        language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const reply = res.data.reply;
      setMessages([...newMessages, { role: 'model', parts: reply }]);

      if (ttsEnabled) {
        // Strip markdown stars for clean audio reading
        const cleanText = reply.replace(/\*/g, '');
        speak(cleanText);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'model', parts: 'Sorry, I failed to process that query. Please make sure the backend is active.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Mic Speech to Text Handler
  const handleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : language;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      speak(language === 'hi' ? "सुन रहा हूँ..." : language === 'es' ? "Escuchando..." : "Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      speak(language === 'hi' ? `सुना: ${transcript}` : language === 'es' ? `Escuchado: ${transcript}` : `Heard: ${transcript}`);
    };

    recognition.onerror = () => {
      setListening(false);
      speak("Speech recognition error.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Sidebar Coaching Insights */}
      <div className="w-full lg:w-80 bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between glass-card">
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
              <Bot className="text-primary h-5 w-5" />
              AI Habit Coach
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              EcoBot analyzes carbon telemetry, outlines high emissions nodes, and creates customized sustainability plans.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-secondary/50 rounded-xl text-xs border border-border">
                <h4 className="font-bold mb-1">💡 Travel Advice</h4>
                <p className="text-muted-foreground">
                  Your transportation contributes the majority of carbon. Swapping 2 drive events with public transit saves ~14% CO₂.
                </p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl text-xs border border-border">
                <h4 className="font-bold mb-1">💡 Diet Tip</h4>
                <p className="text-muted-foreground">
                  Substituting beef for vegetarian menus reduces your dietary carbon footprint by up to 55%.
                </p>
              </div>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="pt-4 border-t space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-primary" /> AI Configuration
            </h4>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span>Select Model</span>
                <span className="text-[10px] text-muted-foreground capitalize font-normal">{model}</span>
              </label>
              <div className="grid grid-cols-2 gap-1 bg-secondary/40 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setModel('gemini')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    model === 'gemini'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/35'
                  }`}
                >
                  Gemini Flash
                </button>
                <button
                  onClick={() => setModel('mistral')}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    model === 'mistral'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/35'
                  }`}
                >
                  Mistral AI
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-primary" /> Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-secondary/40 hover:bg-secondary/60 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-card text-foreground font-medium">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) stopSpeaking();
              speak(ttsEnabled ? "Voice assistant disabled" : "Voice assistant enabled. EcoBot will answer verbally.");
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center justify-center gap-2 ${
              ttsEnabled
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {ttsEnabled ? 'Mute Verbal Answers' : 'Enable Verbal Answers'}
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden glass-card">
        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'model';
            return (
              <div key={index} className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}>
                <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                  isBot
                    ? 'bg-secondary/80 text-foreground rounded-tl-none border border-border'
                    : 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed font-medium">
                    {/* Render markdown bolding as basic JSX bolding */}
                    {msg.parts.split('**').map((chunk, idx) => (idx % 2 === 1 ? <strong key={idx}>{chunk}</strong> : chunk))}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary/50 border border-border rounded-2xl rounded-tl-none p-4 text-sm flex items-center gap-2 text-muted-foreground font-semibold animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                EcoBot is thinking ({model})...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box bottom */}
        <div className="p-4 border-t bg-secondary/20 flex gap-2">
          <button
            onClick={handleMic}
            className={`p-3 rounded-xl border border-border flex items-center justify-center transition-all duration-200 ${
              listening
                ? 'bg-red-500 text-white animate-pulse border-red-600'
                : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title="Speech to Text input"
          >
            <Mic className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              language === 'hi'
                ? "इकोबॉट से पूछें: 'मैं इस सप्ताह कार्बन उत्सर्जन को कैसे कम कर सकता हूँ?'"
                : language === 'es'
                ? "Pregunta a EcoBot: ¿Cómo puedo reducir las emisiones de carbono esta semana?"
                : "Ask EcoBot: 'How can I reduce carbon emissions this week?'"
            }
            className="flex-1 bg-card border border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
          />

          <button
            onClick={() => handleSend()}
            className="bg-primary hover:bg-primary/95 text-white p-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-primary/10"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};


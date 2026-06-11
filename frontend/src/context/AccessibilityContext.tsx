import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export type ContrastType = 'normal' | 'high' | 'colorblind';
export type FontScaleType = 'small' | 'medium' | 'large' | 'xl';

export interface IAccessibilitySettings {
  contrast: ContrastType;
  dyslexicFont: boolean;
  fontScale: FontScaleType;
  reducedMotion: boolean;
  screenReader: boolean;
  voiceNav: boolean;
}

interface AccessibilityContextProps {
  settings: IAccessibilitySettings;
  updateSettings: (newSettings: Partial<IAccessibilitySettings>) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<IAccessibilitySettings>({
    contrast: 'normal',
    dyslexicFont: false,
    fontScale: 'medium',
    reducedMotion: false,
    screenReader: false,
    voiceNav: false
  });

  const [voiceActive, setVoiceActive] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Sync state with DOM classes and root fonts
  useEffect(() => {
    const root = document.documentElement;

    // Apply Contrast Class
    root.classList.remove('high-contrast', 'colorblind');
    if (settings.contrast === 'high') root.classList.add('high-contrast');
    if (settings.contrast === 'colorblind') root.classList.add('colorblind');

    // Apply Dyslexia Font Class
    if (settings.dyslexicFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Apply Font Scale
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    if (settings.fontScale === 'small') root.style.fontSize = '14px';
    if (settings.fontScale === 'medium') root.style.fontSize = '16px';
    if (settings.fontScale === 'large') root.style.fontSize = '18px';
    if (settings.fontScale === 'xl') root.style.fontSize = '20px';

  }, [settings]);

  const updateSettings = async (newSettings: Partial<IAccessibilitySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    // Save to server if logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('/api/auth/accessibility', updated, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to sync accessibility preferences with backend:', err);
      }
    }
  };

  const speak = (text: string) => {
    if (!settings.screenReader || !synth) return;
    synth.cancel(); // cancel existing voice output
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synth) synth.cancel();
  };

  // Keyboard navigation shortcuts global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + A opens/announces accessibility instructions
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        speak("Accessibility mode enabled. Use tab to navigate. Use Shift plus H to return to dashboard. Use Shift plus C to open Calculator.");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.screenReader]);

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      speak,
      stopSpeaking,
      voiceActive,
      setVoiceActive
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

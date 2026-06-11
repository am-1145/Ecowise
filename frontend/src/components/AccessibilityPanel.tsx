import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Eye, Type, Volume2, Mic, Activity, RefreshCw } from 'lucide-react';

export const AccessibilityPanel: React.FC = () => {
  const { settings, updateSettings, speak, stopSpeaking } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const handleTtsTest = () => {
    speak("Screen reader mode is active. EcoWise AI accessibility checks passed.");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Action Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          speak(isOpen ? "Closing accessibility options." : "Opening accessibility options panel.");
        }}
        className="bg-primary hover:bg-primary/90 text-white p-3.5 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
        aria-label="Toggle accessibility options panel"
        id="acc-toggle-btn"
      >
        <Eye className="h-6 w-6" />
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-card text-card-foreground border border-border rounded-xl shadow-2xl p-5 glass-card transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Type className="text-primary h-5 w-5" />
              Accessibility Center (AAA)
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              Close
            </button>
          </div>

          <div className="space-y-4">
            {/* Contrast adjustment */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Color Contrast
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'high', 'colorblind'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSettings({ contrast: mode })}
                    className={`text-xs py-1.5 px-2 rounded font-medium border capitalize ${
                      settings.contrast === mode
                        ? 'bg-primary border-primary text-white'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Font scaling */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Font Scaling
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['small', 'medium', 'large', 'xl'] as const).map((scale) => (
                  <button
                    key={scale}
                    onClick={() => updateSettings({ fontScale: scale })}
                    className={`text-xs py-1 px-1.5 rounded font-medium border capitalize ${
                      settings.fontScale === scale
                        ? 'bg-primary border-primary text-white'
                        : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Toggle options */}
            <div className="space-y-3">
              {/* Dyslexia Font Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dyslexia Friendly Font</span>
                <input
                  type="checkbox"
                  checked={settings.dyslexicFont}
                  onChange={(e) => updateSettings({ dyslexicFont: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reduced Motion</span>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </div>

              {/* Screen Reader TTS Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium flex items-center gap-1">
                    Screen Reader (TTS)
                    <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                  <span className="text-[10px] text-muted-foreground">Reads pages aloud</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => {
                    updateSettings({ screenReader: e.target.checked });
                    if (e.target.checked) setTimeout(handleTtsTest, 300);
                    else stopSpeaking();
                  }}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </div>

              {/* Voice Navigation Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium flex items-center gap-1">
                    Voice Commands
                    <Mic className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                  <span className="text-[10px] text-muted-foreground">Navigate by speech</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.voiceNav}
                  onChange={(e) => updateSettings({ voiceNav: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </div>
            </div>

            {/* Read Aloud Button */}
            {settings.screenReader && (
              <button
                onClick={() => speak(document.body.innerText)}
                className="w-full mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs py-2 rounded font-semibold flex items-center justify-center gap-1.5 border border-border"
              >
                <Activity className="h-3.5 w-3.5" />
                Read Full Page Text
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

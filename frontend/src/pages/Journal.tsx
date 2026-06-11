import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Calendar, Activity, BookOpen, Star, Sparkles } from 'lucide-react';
import axios from 'axios';

export const Journal: React.FC = () => {
  const { token } = useStore();
  const { speak } = useAccessibility();

  // Form States
  const [mood, setMood] = useState(7);
  const [carbonRating, setCarbonRating] = useState(7);
  const [entryText, setEntryText] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Analytics & Logs States
  const [logs, setLogs] = useState<any[]>([]);
  const [correlation, setCorrelation] = useState<any>(null);

  const API_URL = (window as any).ENV?.VITE_API_URL && (window as any).ENV.VITE_API_URL !== '__VITE_API_URL__' ? (window as any).ENV.VITE_API_URL : import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchLogs();
    fetchCorrelation();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/journal`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.journals);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCorrelation = async () => {
    try {
      const res = await axios.get(`${API_URL}/journal/correlation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCorrelation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActivity = (act: string) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter(a => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryText) return;

    try {
      await axios.post(`${API_URL}/journal`, {
        mood: Number(mood),
        carbonScoreRating: Number(carbonRating),
        entryText,
        activities: selectedActivities
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      speak('Journal entry successfully logged! Tracking correlation coefficient.');
      setEntryText('');
      setSelectedActivities([]);
      await fetchLogs();
      await fetchCorrelation();
    } catch (err) {
      console.error(err);
      speak('Failed to save journal log.');
    }
  };

  const activityOptions = [
    'Walking commute',
    'Bicycle travel',
    'Vegetarian diet',
    'Vegan diet',
    'Recycled packaging',
    'Zero plastic purchase',
    'Cold laundry wash',
    'Turned off idle AC'
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mindful Eco Journal</h1>
        <p className="text-muted-foreground mt-1">Reflect on daily habits and discover the correlation between sustainable choices and your mood.</p>
      </div>

      {/* Correlation Insight Widget */}
      {correlation && correlation.hasData && (
        <div className="bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border border-primary/20 p-5 rounded-2xl flex items-start gap-4 shadow-sm glass-card">
          <div className="p-3 bg-primary/20 text-primary rounded-xl mt-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Mood & Habit Correlation</h3>
            <p className="text-base font-bold mt-1 text-foreground">
              {correlation.recommendation}
            </p>
            <div className="flex gap-6 mt-3 text-xs text-muted-foreground font-semibold">
              <span>Average Mood on Eco Days: <strong className="text-primary">{correlation.avgMoodHighEco} / 10</strong></span>
              <span>Average Mood on Standard Days: <strong className="text-foreground">{correlation.avgMoodLowEco} / 10</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log input form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 glass-card">
          <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="text-primary h-5 w-5" />
            Write Daily Reflective Log
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Range controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="mood-slider" className="text-xs font-semibold block mb-1">How is your mood rating today? ({mood}/10)</label>
                <input
                  id="mood-slider"
                  type="range" min="1" max="10" value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label htmlFor="carbon-rating-slider" className="text-xs font-semibold block mb-1">Your Eco-satisfaction today? ({carbonRating}/10)</label>
                <input
                  id="carbon-rating-slider"
                  type="range" min="1" max="10" value={carbonRating}
                  onChange={(e) => setCarbonRating(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Checkbox selector */}
            <div>
              <span className="text-xs font-semibold block mb-2">Activities Performed Today</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {activityOptions.map((act) => {
                  const active = selectedActivities.includes(act);
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => handleToggleActivity(act)}
                      className={`py-1.5 px-2.5 rounded-lg border text-[10px] font-bold text-center truncate transition-all duration-200 ${
                        active
                          ? 'bg-primary border-primary text-white'
                          : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label htmlFor="entry-textarea" className="text-xs font-semibold block mb-1">Daily Reflection Notes</label>
              <textarea
                id="entry-textarea"
                rows={3}
                required
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                placeholder="Today I substituted my vehicle commute with cycling. Felt great to get fresh air and save carbon!..."
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              Save Journal Entry
            </button>
          </form>
        </div>

        {/* History sidebar */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm glass-card flex flex-col">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" />
            Previous Logs
          </h3>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[350px] pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No entries completed yet. Start logging above!</p>
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-3 bg-secondary/30 border border-border rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground border-b pb-1">
                    <span>📅 {new Date(log.date).toLocaleDateString()}</span>
                    <span className="font-bold">Mood: <strong className="text-primary">{log.mood}/10</strong></span>
                  </div>
                  <p className="italic text-muted-foreground leading-relaxed">"{log.entryText}"</p>
                  {log.activities?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {log.activities.map((act: string, idx: number) => (
                        <span key={idx} className="bg-primary/10 border border-primary/20 text-primary py-0.5 px-1.5 rounded-full text-[8px] font-bold">
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

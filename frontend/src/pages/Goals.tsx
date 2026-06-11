import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Award, CheckCircle2, ChevronRight, PlusCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

export const Goals: React.FC = () => {
  const { goals, token, fetchGoals, fetchStats } = useStore();
  const { speak } = useAccessibility();

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'transportation' | 'energy' | 'food' | 'waste' | 'water' | 'general'>('general');
  const [targetValue, setTargetValue] = useState(50);
  const [deadline, setDeadline] = useState('');

  // Forecast states
  const [forecast, setForecast] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchGoals();
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const res = await axios.get(`${API_URL}/goals/forecast`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForecast(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !targetValue || !deadline) {
      speak('Please fill in all required fields.');
      return;
    }

    try {
      await axios.post(`${API_URL}/goals`, {
        title,
        description,
        category,
        targetValue: Number(targetValue),
        deadline: new Date(deadline)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setCategory('general');
      setTargetValue(50);
      setDeadline('');
      setShowAddForm(false);

      speak(`Goal ${title} successfully created! Let's start tracking.`);
      await fetchGoals();
      await fetchForecast();
    } catch (err) {
      console.error(err);
      speak('Failed to create goal.');
    }
  };

  const handleUpdateProgress = async (goalId: string, currentVal: number, step: number) => {
    try {
      const newVal = Math.min(100, currentVal + step);
      await axios.put(`${API_URL}/goals/${goalId}`, {
        currentValue: newVal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      speak(`Milestone progress updated.`);
      await fetchGoals();
      await fetchStats(); // Refresh points
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sustainability Goals</h1>
          <p className="text-muted-foreground mt-1">Set carbon limits, unlock milestone badges, and forecast progress.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            speak(showAddForm ? 'Closing goal form.' : 'Opening new goal form.');
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white py-2.5 px-5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-primary/20 text-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          Add Custom Goal
        </button>
      </div>

      {/* Goal Forecasting Widget */}
      {!loadingForecast && forecast && (
        <div className="bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent border border-primary/20 p-5 rounded-2xl flex items-start gap-4 shadow-sm glass-card">
          <div className="p-3 bg-primary/20 text-primary rounded-xl mt-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Goal Forecasting</h3>
            <p className="text-base font-bold mt-1 text-foreground">
              Your active targets represent an estimated saving of <strong className="text-primary">{forecast.estimatedMonthlySavingsKg} kg CO₂</strong> per month
              (<strong className="text-primary">{forecast.estimatedAnnualSavingsKg} kg</strong> per year).
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Predicted score improvement: <span className="text-primary font-bold">{forecast.forecastingGradeImprovement}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Add Custom Goal Modal/Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl glass-card animate-in slide-in-from-top-5 duration-300">
          <h3 className="font-bold text-lg mb-4">Create Sustainability Target</h3>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="goal-title" className="text-sm font-semibold block mb-1">Goal Title</label>
              <input
                id="goal-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Reduce driving by 20%"
              />
            </div>

            <div>
              <label htmlFor="goal-category" className="text-sm font-semibold block mb-1">Category</label>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="general">General Carbon Saved</option>
                <option value="transportation">Transportation</option>
                <option value="energy">Household Energy</option>
                <option value="food">Dietary & Food</option>
                <option value="waste">Packaging Waste</option>
                <option value="water">Water Savings</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="goal-desc" className="text-sm font-semibold block mb-1">Description (Optional)</label>
              <input
                id="goal-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Walk or cycle instead of taking solo drive trips..."
              />
            </div>

            <div>
              <label htmlFor="goal-target" className="text-sm font-semibold block mb-1">Target Reduction (Points/Times)</label>
              <input
                id="goal-target"
                type="number"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="e.g. 50 times"
              />
            </div>

            <div>
              <label htmlFor="goal-deadline" className="text-sm font-semibold block mb-1">Deadline Date</label>
              <input
                id="goal-deadline"
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-bold border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary/10"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List Render */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground glass-card">
            🏆 You don't have any active sustainability targets. Click "Add Custom Goal" above to configure your first metric limit!
          </div>
        ) : (
          goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / (goal.targetValue || 1)) * 100));
            const achieved = goal.status === 'achieved';

            return (
              <div key={goal._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-lg">{goal.title}</h3>
                    <span className={`text-[10px] uppercase tracking-wider py-0.5 px-2 rounded-full font-bold border ${
                      achieved
                        ? 'bg-primary/15 border-primary/20 text-primary'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{goal.description || 'Target carbon reduction.'}</p>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Progress</span>
                      <span>{pct}% ({goal.currentValue} / {goal.targetValue})</span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Milestones status */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {goal.milestones?.map((milestone: any, idx: number) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 text-[9px] font-bold py-0.5 px-2 rounded-full border ${
                          milestone.achieved
                            ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-secondary border-border text-muted-foreground'
                        }`}
                      >
                        {milestone.achieved ? <CheckCircle2 className="h-3 w-3" /> : '🔒'}
                        {milestone.label}
                      </span>
                    ))}
                  </div>
                </div>

                {!achieved && (
                  <button
                    onClick={() => handleUpdateProgress(goal._id, goal.currentValue, 5)}
                    className="shrink-0 bg-secondary hover:bg-secondary/80 border border-border font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all duration-200 text-foreground"
                  >
                    Advance Target
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

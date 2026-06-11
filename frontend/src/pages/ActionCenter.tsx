import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { ListTodo, CheckCircle2, Circle, AlertCircle, Plus } from 'lucide-react';
import axios from 'axios';

export const ActionCenter: React.FC = () => {
  const { actions, token, fetchActions, fetchProfile } = useStore();
  const { speak } = useAccessibility();

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Custom Action Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'transportation' | 'energy' | 'food' | 'waste' | 'water'>('energy');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [impact, setImpact] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedSavings, setEstimatedSavings] = useState(100);
  const [timeRequired, setTimeRequired] = useState('1 hour');

  const API_URL = (window as any).ENV?.VITE_API_URL && (window as any).ENV.VITE_API_URL !== '__VITE_API_URL__' ? (window as any).ENV.VITE_API_URL : import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchActions();
  }, []);

  const handleUpdateStatus = async (actionId: string, newStatus: 'planned' | 'active' | 'completed') => {
    try {
      const res = await axios.put(`${API_URL}/actions/${actionId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      speak(`Action item updated to ${newStatus}.`);
      if (newStatus === 'completed') {
        const rewards = res.data.rewards;
        speak(`Congratulations! You earned ${rewards.points} points and ${rewards.xp} XP!`);
      }

      await fetchActions();
      await fetchProfile(); // Update header score
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      speak('Please fill in action title and description.');
      return;
    }

    try {
      await axios.post(`${API_URL}/actions`, {
        title,
        description,
        category,
        difficulty,
        impact,
        estimatedSavings: Number(estimatedSavings),
        timeRequired
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setCategory('energy');
      setDifficulty('easy');
      setImpact('medium');
      setEstimatedSavings(100);
      setTimeRequired('1 hour');
      setShowAddForm(false);

      speak(`Custom action ${title} successfully scheduled in Action Center.`);
      await fetchActions();
    } catch (err) {
      console.error(err);
      speak('Failed to save custom action.');
    }
  };

  const filteredActions = filterCategory === 'all'
    ? actions
    : actions.filter(act => act.category === filterCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Smart Action Center</h1>
          <p className="text-muted-foreground mt-1">Recommended custom action items tailored to reduce carbon footprint.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            speak(showAddForm ? 'Closing custom action scheduler.' : 'Opening custom action scheduler.');
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white py-2.5 px-5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-primary/20 text-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          Schedule Custom Action
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {['all', 'energy', 'transportation', 'food', 'waste', 'water'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilterCategory(cat);
              speak(`Filtering actions by ${cat}`);
            }}
            className={`text-xs py-2 px-4 rounded-full font-bold border capitalize whitespace-nowrap transition-all duration-200 ${
              filterCategory === cat
                ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {cat === 'all' ? 'All Recommendations' : cat}
          </button>
        ))}
      </div>

      {/* Add Custom Action Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl glass-card animate-in slide-in-from-top-5 duration-300">
          <h3 className="font-bold text-lg mb-4">Schedule Custom Climate Action</h3>
          <form onSubmit={handleCreateCustomAction} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="act-title" className="text-sm font-semibold block mb-1">Action Title</label>
              <input
                id="act-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Unplug power strips at night"
              />
            </div>

            <div>
              <label htmlFor="act-category" className="text-sm font-semibold block mb-1">Category</label>
              <select
                id="act-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="energy">Household Energy</option>
                <option value="transportation">Transportation</option>
                <option value="food">Dietary & Food</option>
                <option value="waste">Packaging Waste</option>
                <option value="water">Water Savings</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="act-desc" className="text-sm font-semibold block mb-1">Description</label>
              <input
                id="act-desc"
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Turn off electrical extenders before bed to stop standby phantom loads."
              />
            </div>

            <div>
              <label htmlFor="act-difficulty" className="text-sm font-semibold block mb-1">Difficulty</label>
              <select
                id="act-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="easy">Easy (Simple habit change)</option>
                <option value="medium">Medium (Moderate planning required)</option>
                <option value="hard">Hard (Significant change or cost)</option>
              </select>
            </div>

            <div>
              <label htmlFor="act-impact" className="text-sm font-semibold block mb-1">Greenhouse Impact</label>
              <select
                id="act-impact"
                value={impact}
                onChange={(e) => setImpact(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="low">Low Impact (&lt; 20kg CO₂ saved/yr)</option>
                <option value="medium">Medium Impact (20-150kg CO₂ saved/yr)</option>
                <option value="high">High Impact (&gt; 150kg CO₂ saved/yr)</option>
              </select>
            </div>

            <div>
              <label htmlFor="act-savings" className="text-sm font-semibold block mb-1">CO₂ Savings (kg/Year)</label>
              <input
                id="act-savings"
                type="number"
                required
                value={estimatedSavings}
                onChange={(e) => setEstimatedSavings(Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label htmlFor="act-time" className="text-sm font-semibold block mb-1">Time Required</label>
              <input
                id="act-time"
                type="text"
                required
                value={timeRequired}
                onChange={(e) => setTimeRequired(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="e.g. 5 minutes"
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
                Save Action
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Items List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground glass-card">
            🌿 No recommended items found matching this filter category. Try adding a custom planned action!
          </div>
        ) : (
          filteredActions.map((act) => {
            const completed = act.status === 'completed';
            const active = act.status === 'active';

            return (
              <div
                key={act._id}
                className={`bg-card border rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  completed ? 'opacity-65 border-primary/20 bg-primary/5' : 'border-border glass-card'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Toggle Icon */}
                  <button
                    onClick={() => {
                      const next = completed ? 'planned' : active ? 'completed' : 'active';
                      handleUpdateStatus(act._id, next);
                    }}
                    className="mt-1 shrink-0 text-primary hover:scale-105 transition-transform"
                    aria-label={`Mark as ${completed ? 'planned' : active ? 'completed' : 'active'}`}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-6 w-6 fill-primary/10" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <h3 className={`font-bold text-base ${completed ? 'line-through text-muted-foreground' : ''}`}>
                      {act.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{act.description}</p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="inline-flex text-[9px] font-bold py-0.5 px-2 rounded-full bg-secondary border border-border text-muted-foreground capitalize">
                        {act.category}
                      </span>
                      <span className={`inline-flex text-[9px] font-bold py-0.5 px-2 rounded-full border capitalize ${
                        act.difficulty === 'hard' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        act.difficulty === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}>
                        Diff: {act.difficulty}
                      </span>
                      <span className="inline-flex text-[9px] font-bold py-0.5 px-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        Impact: {act.impact}
                      </span>
                      <span className="inline-flex text-[9px] font-bold py-0.5 px-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                        ⚡ {act.timeRequired}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-end gap-2 text-right">
                  <span className="text-sm font-bold text-foreground block">
                    -{act.estimatedSavings} kg CO₂ / yr
                  </span>
                  <div className="flex gap-2.5">
                    {!completed && !active && (
                      <button
                        onClick={() => handleUpdateStatus(act._id, 'active')}
                        className="text-[10px] font-bold py-1 px-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg"
                      >
                        Activate
                      </button>
                    )}
                    {active && (
                      <button
                        onClick={() => handleUpdateStatus(act._id, 'completed')}
                        className="text-[10px] font-bold py-1 px-3 bg-primary hover:bg-primary/95 text-white rounded-lg"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

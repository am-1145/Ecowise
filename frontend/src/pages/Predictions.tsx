import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TrendingDown, ShieldAlert, Sparkles } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export const Predictions: React.FC = () => {
  const { token } = useStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await axios.get(`${API_URL}/carbon/predictions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to load predictions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-bold text-lg text-muted-foreground">
        📊 Calculating prediction models...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Carbon Prediction Engine</h1>
        <p className="text-muted-foreground mt-1">See your forecasted greenhouse gas emissions trend based on history.</p>
      </div>

      {/* Target forecast grades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4 glass-card">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Best Case (Target Habits)</h3>
            <p className="text-2xl font-extrabold text-emerald-500 mt-1">
              {data?.annualForecast?.best ? (data.annualForecast.best / 1000).toFixed(2) : '2.95'} <span className="text-xs font-semibold text-muted-foreground">Tonnes/Yr</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Assuming you adopt all planned AI actions.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4 glass-card">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Average Case (Extrapolated)</h3>
            <p className="text-2xl font-extrabold text-foreground mt-1">
              {data?.annualForecast?.average ? (data.annualForecast.average / 1000).toFixed(2) : '3.80'} <span className="text-xs font-semibold text-muted-foreground">Tonnes/Yr</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Maintaining your current average daily logs.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4 glass-card">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Worst Case (Rising Energy)</h3>
            <p className="text-2xl font-extrabold text-red-500 mt-1">
              {data?.annualForecast?.worst ? (data.annualForecast.worst / 1000).toFixed(2) : '4.40'} <span className="text-xs font-semibold text-muted-foreground">Tonnes/Yr</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Projection under increased consumption levels.</p>
          </div>
        </div>
      </div>

      {/* Prediction Chart Monthly */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card">
        <h3 className="font-bold text-lg mb-4">Emissions Scenario Modeling (Monthly Projection)</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="kg" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="best" name="Best Case (Eco Target)" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.05} />
              <Area type="monotone" dataKey="average" name="Average Case (Baseline)" stroke="#3b82f6" strokeWidth={2.5} fill="#3b82f6" fillOpacity={0.02} />
              <Area type="monotone" dataKey="worst" name="Worst Case (Heavy Usage)" stroke="#ef4444" strokeWidth={2.5} fill="#ef4444" fillOpacity={0.01} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prediction Chart Daily */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card">
        <h3 className="font-bold text-lg mb-4">Short-term Emissions Scenario Modeling (Next 7 Days)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.daily || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="kg" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="best" name="Best Case" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.05} />
              <Area type="monotone" dataKey="average" name="Average Case" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.02} />
              <Area type="monotone" dataKey="worst" name="Worst Case" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.01} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

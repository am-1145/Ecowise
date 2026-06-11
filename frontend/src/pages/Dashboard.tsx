import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Flame, ShieldAlert, Award, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const Dashboard: React.FC = () => {
  const { user, stats, activities, fetchStats, fetchActivities } = useStore();
  const { speak } = useAccessibility();

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

  const handleDownloadReport = async () => {
    speak("Compiling and generating your sustainability PDF report. Please wait.");
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/report/pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important to fetch binary stream
      });

      // Trigger standard browser download dialog
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sustainability_report_${user?.name?.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      speak("Report downloaded successfully.");
    } catch (err) {
      console.error('Failed to download report:', err);
      speak("Report generation failed. Please try again.");
    }
  };

  // Recharts mock history trends if no logs
  const defaultChartData = [
    { name: 'Week 1', co2: 84 },
    { name: 'Week 2', co2: 78 },
    { name: 'Week 3', co2: 70 },
    { name: 'Week 4', co2: 65 },
    { name: 'Week 5', co2: stats?.averages?.total ? Math.round(stats.averages.total * 7) : 62 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back, {user?.name || 'Eco-Warrior'}!</h1>
          <p className="text-muted-foreground mt-1">Let's check your climate action roadmap and telemetry today.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white py-2.5 px-5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-primary/20"
        >
          <FileText className="h-4.5 w-4.5" />
          Download PDF Report
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Score Dial */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-sm glass-card">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Carbon Score</span>
            <span className="text-4xl font-extrabold text-primary">{stats?.score || 80}</span>
            <span className="text-xs text-muted-foreground block">Grade: <strong className="text-foreground">{stats?.grade || 'B+'}</strong></span>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center font-bold text-lg text-primary rotate-45">
            <span className="-rotate-45">{stats?.score || 80}%</span>
          </div>
        </div>

        {/* Saved CO2 */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">CO₂ Offset / Saved</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-foreground">{stats?.co2Saved || 24}</span>
            <span className="text-sm font-semibold text-muted-foreground">kg CO₂</span>
          </div>
          <p className="text-xs text-emerald-500 font-semibold mt-2">🌿 Exceeding average local targets!</p>
        </div>

        {/* Active Streak */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Eco Activity Streak</span>
            <div className="flex items-baseline gap-1.5 text-orange-500">
              <span className="text-4xl font-extrabold">{user?.streak || 0}</span>
              <span className="text-sm font-bold">Days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Log daily to protect streak</p>
          </div>
          <Flame className="h-12 w-12 text-orange-500 fill-orange-500/20" />
        </div>

        {/* Annual Forecast */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Annual CO₂ Projection</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {stats?.annualProjection ? (stats.annualProjection / 1000).toFixed(2) : '3.80'}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">Tonnes</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Safe climate target: &lt; 2.00 Tonnes</p>
        </div>
      </div>

      {/* Main Charts & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 glass-card">
          <h3 className="font-bold text-lg mb-4">Emissions Weekly Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={defaultChartData}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="kg" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="co2" name="Carbon footprint" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCo2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between glass-card">
          <div>
            <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/calculator" className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/70 transition-all duration-200 group">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Log Today's Carbon</span>
                  <span className="text-xs text-muted-foreground">Log transit, energy, foods</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link to="/bot" className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/70 transition-all duration-200 group">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Ask EcoBot Advice</span>
                  <span className="text-xs text-muted-foreground">AI habit parsing chat</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link to="/scanner" className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/70 transition-all duration-200 group">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Scan Energy Bills</span>
                  <span className="text-xs text-muted-foreground">OCR receipt upload</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Badges</h4>
            <div className="flex flex-wrap gap-2">
              {user?.badges?.slice(0, 3).map((badge: string, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  {badge}
                </span>
              )) || <span className="text-xs text-muted-foreground">No achievements yet.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

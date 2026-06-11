import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck, ShieldAlert, Users, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';

export const Admin: React.FC = () => {
  const { user, token } = useStore();
  const { speak } = useAccessibility();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = (window as any).ENV?.VITE_API_URL && (window as any).ENV.VITE_API_URL !== '__VITE_API_URL__' ? (window as any).ENV.VITE_API_URL : import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    fetchPlatformStats();
  }, [user]);

  const fetchPlatformStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Access Denied. You do not possess administrator rights.');
      speak('Access Denied. Administrator rights required.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
        <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl">
          <ShieldAlert className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-extrabold">Administrator Access Required</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          This panel is restricted to administrative staff to manage databases and analyze aggregate stats.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-bold text-lg text-muted-foreground">
        🔒 Syncing administrative records...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-primary h-8 w-8" />
          EcoWise Administration Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Review user accounts statistics and platform-wide carbon capture metrics.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl text-center text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Analytics widgets */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Members</span>
              <span className="text-3xl font-extrabold text-foreground">{stats.totalUsers}</span>
            </div>
            <Users className="h-10 w-10 text-primary opacity-60" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Active Users (7d)</span>
              <span className="text-3xl font-extrabold text-foreground">{stats.activeUsers}</span>
            </div>
            <Award className="h-10 w-10 text-primary opacity-60" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Offsets Purchased</span>
              <span className="text-3xl font-extrabold text-emerald-500">{(stats.totalOffsetKg / 1000).toFixed(1)}t</span>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-500 opacity-60" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Carbon Savings</span>
              <span className="text-3xl font-extrabold text-primary">{(stats.totalCarbonSavedKg / 1000).toFixed(1)}t</span>
            </div>
            <span className="text-4xl">🌿</span>
          </div>
        </div>
      )}

      {/* User growth stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 glass-card">
          <h3 className="font-bold text-lg mb-4">Platform Registration Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.userGrowthSeries || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Database configurations helper */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card space-y-4">
          <h3 className="font-bold text-lg">System Administration</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure system coefficients, update compliance settings, and moderate public challenges.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-secondary/50 border border-border rounded-xl">
              <span className="font-semibold block text-foreground">API Connection:</span>
              <span className="text-[10px] text-emerald-500 font-bold">● Active (Connected to Atlas DB)</span>
            </div>

            <div className="p-3 bg-secondary/50 border border-border rounded-xl">
              <span className="font-semibold block text-foreground">Tesseract OCR State:</span>
              <span className="text-[10px] text-emerald-500 font-bold">● Operational (Local/Heuristics active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

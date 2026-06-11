import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useAccessibility } from './context/AccessibilityContext';
import { AccessibilityPanel } from './components/AccessibilityPanel';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import { Calculator } from './pages/Calculator';
import { EcoBot } from './pages/EcoBot';
import { Predictions } from './pages/Predictions';
import { Goals } from './pages/Goals';
import { ActionCenter } from './pages/ActionCenter';
import { Scanner } from './pages/Scanner';
import { RoutePlanner } from './pages/RoutePlanner';
import { Marketplace } from './pages/Marketplace';
import { Community } from './pages/Community';
import { Journal } from './pages/Journal';
import { Admin } from './pages/Admin';
import { Auth } from './pages/Auth';

import {
  LayoutDashboard,
  Calculator as CalcIcon,
  Bot,
  TrendingUp,
  Award,
  ListTodo,
  QrCode,
  Map,
  ShoppingBag,
  Users,
  BookOpen,
  Calendar,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, fetchProfile, fetchStats } = useStore();
  const { settings, speak } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load profile telemetry on startup
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  // Voice Command Navigation Hook
  useEffect(() => {
    if (!settings.voiceNav) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice Command received:', command);

      if (command.includes('go to dashboard') || command.includes('show dashboard')) {
        speak('Navigating to dashboard.');
        navigate('/');
      } else if (command.includes('go to calculator') || command.includes('open calculator')) {
        speak('Opening carbon calculator.');
        navigate('/calculator');
      } else if (command.includes('go to assistant') || command.includes('open bot') || command.includes('talk to bot')) {
        speak('Opening AI chatbot Eco Bot.');
        navigate('/bot');
      } else if (command.includes('go to prediction') || command.includes('show predictions')) {
        speak('Opening prediction dashboard.');
        navigate('/predictions');
      } else if (command.includes('go to goals') || command.includes('show goals')) {
        speak('Opening sustainability goals tracker.');
        navigate('/goals');
      } else if (command.includes('go to action') || command.includes('open action center')) {
        speak('Opening smart action center.');
        navigate('/actions');
      } else if (command.includes('go to scan') || command.includes('open scanner')) {
        speak('Opening bill receipt scanner.');
        navigate('/scanner');
      } else if (command.includes('go to map') || command.includes('open routes')) {
        speak('Opening green route planner.');
        navigate('/routes');
      } else if (command.includes('go to market') || command.includes('open marketplace')) {
        speak('Opening sustainability offset marketplace.');
        navigate('/marketplace');
      } else if (command.includes('go to community') || command.includes('open teams')) {
        speak('Opening community challenges.');
        navigate('/community');
      } else if (command.includes('go to journal') || command.includes('open journal')) {
        speak('Opening sustainability journal.');
        navigate('/journal');
      } else if (command.includes('go to admin') || command.includes('open admin')) {
        speak('Opening admin panel.');
        navigate('/admin');
      }
    };

    recognition.start();
    return () => {
      try {
        recognition.stop();
      } catch (err) {}
    };
  }, [settings.voiceNav]);

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calculator', label: 'Carbon Calculator', icon: CalcIcon },
    { path: '/bot', label: 'EcoBot Assistant', icon: Bot },
    { path: '/predictions', label: 'Predictions', icon: TrendingUp },
    { path: '/goals', label: 'Goals & Milestones', icon: Award },
    { path: '/actions', label: 'Action Center', icon: ListTodo },
    { path: '/scanner', label: 'OCR Scanner', icon: QrCode },
    { path: '/routes', label: 'Green Routes', icon: Map },
    { path: '/marketplace', label: 'Eco Marketplace', icon: ShoppingBag },
    { path: '/community', label: 'Community & Teams', icon: Users },
    { path: '/journal', label: 'Eco Journal', icon: Calendar },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ path: '/admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  const handleLogout = () => {
    speak('Logging out of EcoWise AI.');
    logout();
    navigate('/login');
  };

  const handleTtsNav = (label: string) => {
    speak(`Opening ${label} page`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row transition-all duration-300">
      {/* Sidebar Navigation */}
      <aside className={`w-72 bg-card border-r border-border flex flex-col z-40 transition-transform duration-300 fixed md:static inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              EcoWise AI
            </span>
          </Link>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleTtsNav(link.label);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile details bottom */}
        <div className="p-4 border-t border-border bg-secondary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
              {user?.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name || 'Loading User...'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>

          {/* User Telemetry Indicators */}
          <div className="flex items-center gap-6 ml-auto md:ml-0">
            {/* Eco Streak */}
            <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm bg-orange-500/10 px-3 py-1.5 rounded-full" title="Eco Streak Days">
              <Flame className="h-4 w-4 fill-orange-500" />
              <span>{user?.streak || 0} Day Streak</span>
            </div>

            {/* User Level */}
            <div className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full" title="Sustainability Level">
              <Award className="h-4 w-4" />
              <span>Level {user?.level || 1}</span>
            </div>

            {/* Total Points */}
            <div className="text-sm font-bold bg-secondary/80 px-3 py-1.5 rounded-full border border-border">
              🏆 <span className="text-primary">{user?.points || 0}</span> Points
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Dark mode switcher */}
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                speak(`Switching to ${!darkMode ? 'dark' : 'light'} mode`);
              }}
              className="p-2.5 rounded-lg border border-border hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Toggle dark mode theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Router View mounting */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AccessibilityPanel />
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Auth type="login" />} />
      <Route path="/register" element={<Auth type="register" />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/calculator" element={<ProtectedRoute><Calculator /></ProtectedRoute>} />
      <Route path="/bot" element={<ProtectedRoute><EcoBot /></ProtectedRoute>} />
      <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
      <Route path="/actions" element={<ProtectedRoute><ActionCenter /></ProtectedRoute>} />
      <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      <Route path="/routes" element={<ProtectedRoute><RoutePlanner /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

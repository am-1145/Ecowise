import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Map, Navigation, Compass, Search, Tag, Eye } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

export const RoutePlanner: React.FC = () => {
  const { token } = useStore();
  const { speak } = useAccessibility();

  // Route Planning States
  const [origin, setOrigin] = useState('Financial District, SF');
  const [destination, setDestination] = useState('Mission District, SF');
  const [routes, setRoutes] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);

  // Nearby Service POI States
  const [radius, setRadius] = useState(5);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);


  useEffect(() => {
    fetchNearbyPOIs();
  }, [radius]);

  const fetchNearbyPOIs = async () => {
    setLoadingServices(true);
    try {
      const res = await axios.get(`${API_URL}/map/services`, {
        params: { radius },
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleRouteCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      speak('Please input origin and destination.');
      return;
    }

    setCalculating(true);
    speak(`Computing green transits from ${origin} to ${destination}`);

    try {
      const res = await axios.get(`${API_URL}/map/route`, {
        params: { origin, destination },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(res.data.routes);
      speak('Green routes calculated. Walking and biking are zero carbon.');
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Green Route Planner & Local Eco Map</h1>
        <p className="text-muted-foreground mt-1">Compare transportation emissions carbon outputs and find nearby sustainable companies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Route planner form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 glass-card flex flex-col justify-between">
          <form onSubmit={handleRouteCalc} className="space-y-5">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Navigation className="text-primary h-5 w-5" />
              Green Route Comparison
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origin-input" className="text-xs font-semibold block mb-1">Start Location</label>
                <input
                  id="origin-input"
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-foreground"
                />
              </div>

              <div>
                <label htmlFor="dest-input" className="text-xs font-semibold block mb-1">Destination Location</label>
                <input
                  id="dest-input"
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all duration-200"
            >
              {calculating ? 'Calculating Carbon...' : 'Calculate Eco Routes'}
            </button>
          </form>

          {/* Route results */}
          {routes.length > 0 && (
            <div className="mt-6 border-t border-border pt-6 space-y-4 animate-in fade-in duration-300">
              <h4 className="font-bold text-sm">Mode Averages compared</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {routes.map((mode, idx) => (
                  <div key={idx} className="p-3 bg-secondary/50 border border-border rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">{mode.mode}</span>
                      <span className="text-base font-bold text-foreground mt-1">{mode.carbonKg} kg CO₂</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold mt-1">🕒 {mode.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side POIs list */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm glass-card flex flex-col">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Compass className="text-primary h-5 w-5" />
              Eco Facilities
            </h3>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-2 py-1 bg-secondary/50 border border-border rounded-lg text-xs font-semibold focus:outline-none text-foreground"
              aria-label="Filter radius miles"
            >
              <option value="5">5 Miles</option>
              <option value="10">10 Miles</option>
              <option value="25">25 Miles</option>
            </select>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {loadingServices ? (
              <p className="text-xs text-muted-foreground">Scanning map...</p>
            ) : services.length === 0 ? (
              <p className="text-xs text-muted-foreground">No green services found nearby.</p>
            ) : (
              services.map((poi, idx) => (
                <div key={idx} className="p-3 bg-secondary/30 hover:bg-secondary/60 border border-border rounded-xl text-xs space-y-1 transition-all duration-200">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-foreground truncate max-w-[150px]">{poi.name}</p>
                    <span className="text-[9px] font-bold py-0.5 px-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase">
                      {poi.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{poi.address}</p>
                  <div className="flex justify-between items-center pt-1 text-[10px] text-muted-foreground">
                    <span>📍 {poi.distanceMiles} Miles</span>
                    {poi.chargingPorts && (
                      <span className="font-bold text-primary">⚡ {poi.chargingPorts} Ports</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

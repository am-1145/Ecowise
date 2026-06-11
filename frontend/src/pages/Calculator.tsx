import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { Car, Zap, Utensils, ShoppingBag, Trash2, Droplets, CheckCircle2 } from 'lucide-react';

export const Calculator: React.FC = () => {
  const { logActivity, loading } = useStore();
  const { speak } = useAccessibility();

  // Tab State
  const [activeTab, setActiveTab] = useState<'transport' | 'energy' | 'food' | 'shopping' | 'waste' | 'water'>('transport');

  // Input States
  const [carKm, setCarKm] = useState(15);
  const [evKm, setEvKm] = useState(0);
  const [bikeKm, setBikeKm] = useState(0);
  const [busKm, setBusKm] = useState(0);
  const [metroKm, setMetroKm] = useState(0);
  const [flightHours, setFlightHours] = useState(0);

  const [electricityKwh, setElectricityKwh] = useState(8);
  const [acHours, setAcHours] = useState(2);
  const [appliancesHours, setAppliancesHours] = useState(4);

  const [dietType, setDietType] = useState<'mixed' | 'vegetarian' | 'vegan' | 'meat-heavy'>('mixed');
  const [servings, setServings] = useState(3);

  const [onlineItems, setOnlineItems] = useState(0);
  const [fashionItems, setFashionItems] = useState(0);
  const [electronicsItems, setElectronicsItems] = useState(0);

  const [recyclableKg, setRecyclableKg] = useState(1);
  const [nonRecyclableKg, setNonRecyclableKg] = useState(2);

  const [waterLiters, setWaterLiters] = useState(150);

  const [instantTotal, setInstantTotal] = useState(0);
  const [logSuccess, setLogSuccess] = useState(false);

  // Recalculate instant estimation on state changes
  useEffect(() => {
    let carbon = 0;
    // Transit
    carbon += carKm * 0.18;
    carbon += evKm * 0.05;
    carbon += busKm * 0.06;
    carbon += metroKm * 0.03;
    carbon += flightHours * 90.0;

    // Energy
    carbon += electricityKwh * 0.45;
    carbon += acHours * 0.9;
    carbon += appliancesHours * 0.2;

    // Diet
    const dietFactor = dietType === 'vegan' ? 0.9 :
                       dietType === 'vegetarian' ? 1.5 :
                       dietType === 'meat-heavy' ? 6.5 :
                       3.2;
    carbon += servings * dietFactor;

    // Goods
    carbon += onlineItems * 0.8;
    carbon += fashionItems * 12.0;
    carbon += electronicsItems * 45.0;

    // Waste
    carbon += recyclableKg * 0.05;
    carbon += nonRecyclableKg * 0.95;

    // Water
    carbon += waterLiters * 0.002;

    setInstantTotal(Math.round(carbon * 100) / 100);
  }, [
    carKm, evKm, bikeKm, busKm, metroKm, flightHours,
    electricityKwh, acHours, appliancesHours,
    dietType, servings,
    onlineItems, fashionItems, electronicsItems,
    recyclableKg, nonRecyclableKg,
    waterLiters
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogSuccess(false);

    const payload = {
      transportation: { carKm, bikeKm, evKm, busKm, metroKm, flightHours },
      energy: { electricityKwh, acHours, appliancesHours },
      food: { dietType, servings },
      shopping: { onlineItems, fashionItems, electronicsItems },
      waste: { recyclableKg, nonRecyclableKg },
      water: { liters: waterLiters }
    };

    try {
      await logActivity(payload);
      setLogSuccess(true);
      speak(`Carbon footprint logged successfully. Total daily carbon impact computed as ${instantTotal} kilograms of CO2.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      speak("Failed to log activity. Please verify input values.");
    }
  };

  const tabs = [
    { id: 'transport', label: 'Transit', icon: Car },
    { id: 'energy', label: 'Household Energy', icon: Zap },
    { id: 'food', label: 'Diet & Meals', icon: Utensils },
    { id: 'shopping', label: 'Shopping & Goods', icon: ShoppingBag },
    { id: 'waste', label: 'Waste Disposal', icon: Trash2 },
    { id: 'water', label: 'Water Consumption', icon: Droplets },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Carbon Footprint Calculator</h1>
        <p className="text-muted-foreground mt-1">Log your lifestyle telemetry to estimate your daily climate impact.</p>
      </div>

      {logSuccess && (
        <div className="bg-primary/10 border border-primary text-primary p-4 rounded-2xl flex items-center gap-3 font-semibold shadow-sm animate-bounce">
          <CheckCircle2 className="h-6 w-6" />
          <span>Footprint logged successfully! Earned +20 XP and +5 points!</span>
        </div>
      )}

      {/* Split Calculator Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Input Panel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2 glass-card flex flex-col">
          {/* Tab buttons */}
          <div className="flex border-b overflow-x-auto pb-px mb-6 scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    speak(`Showing ${tab.label} calculator options.`);
                  }}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
            {/* Tab Panels */}
            <div className="space-y-5">
              {activeTab === 'transport' && (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="car-slider">Standard Combustion Car Travel ({carKm} km)</label>
                      <span className="text-muted-foreground">~{Math.round(carKm * 0.18)} kg CO₂</span>
                    </div>
                    <input
                      id="car-slider"
                      type="range" min="0" max="250" value={carKm}
                      onChange={(e) => setCarKm(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="ev-slider">EV Travel ({evKm} km)</label>
                      <span className="text-muted-foreground">~{Math.round(evKm * 0.05)} kg CO₂</span>
                    </div>
                    <input
                      id="ev-slider"
                      type="range" min="0" max="250" value={evKm}
                      onChange={(e) => setEvKm(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="public-transit-slider">Public Transit Bus/Metro ({busKm + metroKm} km)</label>
                      <span className="text-muted-foreground">~{Math.round((busKm * 0.06) + (metroKm * 0.03))} kg CO₂</span>
                    </div>
                    <input
                      id="public-transit-slider"
                      type="range" min="0" max="150" value={busKm}
                      onChange={(e) => {
                        setBusKm(Number(e.target.value));
                        setMetroKm(Number(e.target.value));
                      }}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="flight-slider">Commercial Flight Flight Hours ({flightHours} hrs)</label>
                      <span className="text-muted-foreground">~{flightHours * 90} kg CO₂</span>
                    </div>
                    <input
                      id="flight-slider"
                      type="range" min="0" max="24" value={flightHours}
                      onChange={(e) => setFlightHours(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'energy' && (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="electricity-slider">Electricity Usage ({electricityKwh} kWh)</label>
                      <span className="text-muted-foreground">~{(electricityKwh * 0.45).toFixed(1)} kg CO₂</span>
                    </div>
                    <input
                      id="electricity-slider"
                      type="range" min="0" max="50" value={electricityKwh}
                      onChange={(e) => setElectricityKwh(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="ac-slider">Air Conditioning Operating ({acHours} hrs)</label>
                      <span className="text-muted-foreground">~{(acHours * 0.9).toFixed(1)} kg CO₂</span>
                    </div>
                    <input
                      id="ac-slider"
                      type="range" min="0" max="24" value={acHours}
                      onChange={(e) => setAcHours(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="appliances-slider">Electronic Appliances ({appliancesHours} hrs)</label>
                      <span className="text-muted-foreground">~{(appliancesHours * 0.2).toFixed(1)} kg CO₂</span>
                    </div>
                    <input
                      id="appliances-slider"
                      type="range" min="0" max="24" value={appliancesHours}
                      onChange={(e) => setAppliancesHours(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'food' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="diet-select" className="text-sm font-semibold block mb-2">Dietary Pattern</label>
                    <select
                      id="diet-select"
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value as any)}
                      className="block w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    >
                      <option value="vegan">Vegan (Completely plant-based)</option>
                      <option value="vegetarian">Vegetarian (No meat, dairy/eggs included)</option>
                      <option value="mixed">Mixed (Typical moderate meat & produce)</option>
                      <option value="meat-heavy">Meat-heavy (Regular beef/pork meals)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="servings-slider">Meal Servings logged ({servings} meals)</label>
                      <span className="text-muted-foreground">~{dietType === 'vegan' ? (servings * 0.9).toFixed(1) : dietType === 'vegetarian' ? (servings * 1.5).toFixed(1) : dietType === 'meat-heavy' ? (servings * 6.5).toFixed(1) : (servings * 3.2).toFixed(1)} kg CO₂</span>
                    </div>
                    <input
                      id="servings-slider"
                      type="range" min="1" max="6" value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'shopping' && (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="online-items-slider">Online Deliveries Purchased ({onlineItems} packages)</label>
                      <span className="text-muted-foreground">~{(onlineItems * 0.8).toFixed(1)} kg CO₂</span>
                    </div>
                    <input
                      id="online-items-slider"
                      type="range" min="0" max="15" value={onlineItems}
                      onChange={(e) => setOnlineItems(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="fashion-items-slider">Clothing / Fashion purchases ({fashionItems} items)</label>
                      <span className="text-muted-foreground">~{fashionItems * 12} kg CO₂</span>
                    </div>
                    <input
                      id="fashion-items-slider"
                      type="range" min="0" max="10" value={fashionItems}
                      onChange={(e) => setFashionItems(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="electronics-items-slider">Consumer Electronics purchased ({electronicsItems} items)</label>
                      <span className="text-muted-foreground">~{electronicsItems * 45} kg CO₂</span>
                    </div>
                    <input
                      id="electronics-items-slider"
                      type="range" min="0" max="3" value={electronicsItems}
                      onChange={(e) => setElectronicsItems(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'waste' && (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="recyclable-slider">Recyclable waste discarded ({recyclableKg} kg)</label>
                      <span className="text-muted-foreground">~{(recyclableKg * 0.05).toFixed(2)} kg CO₂</span>
                    </div>
                    <input
                      id="recyclable-slider"
                      type="range" min="0" max="15" value={recyclableKg}
                      onChange={(e) => setRecyclableKg(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="non-recyclable-slider">Non-recyclable trash ({nonRecyclableKg} kg)</label>
                      <span className="text-muted-foreground">~{(nonRecyclableKg * 0.95).toFixed(1)} kg CO₂</span>
                    </div>
                    <input
                      id="non-recyclable-slider"
                      type="range" min="0" max="15" value={nonRecyclableKg}
                      onChange={(e) => setNonRecyclableKg(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'water' && (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <label htmlFor="water-slider">Daily Water Volume ({waterLiters} Liters)</label>
                      <span className="text-muted-foreground">~{(waterLiters * 0.002).toFixed(2)} kg CO₂</span>
                    </div>
                    <input
                      id="water-slider"
                      type="range" min="20" max="500" value={waterLiters}
                      onChange={(e) => setWaterLiters(Number(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : "Submit & Log Today's Activity"}
            </button>
          </form>
        </div>

        {/* Right Side Instant Calculation Gauge Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center glass-card">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Instant Carbon Estimation</span>
          <div className="relative flex items-center justify-center h-48 w-48 mb-4">
            {/* Circular Gauge Border */}
            <div className="absolute inset-0 rounded-full border-[10px] border-primary/20" />
            <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-primary rotate-45" />

            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-foreground">{instantTotal}</span>
              <span className="text-xs font-bold text-muted-foreground">kg CO₂ / Day</span>
            </div>
          </div>

          <div className="space-y-3 w-full">
            <div className="p-3 bg-secondary/50 rounded-xl text-left border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Target comparison</p>
              <p className="text-sm font-bold text-foreground mt-1">
                {instantTotal < 8 ? '🌟 Outstanding! Below sustainable target.' :
                 instantTotal < 15 ? '👍 Good. On par with standard targets.' :
                 '⚠️ Caution. Exceeding recommended carbon targets.'}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Calculations are computed using verified climate research greenhouse gas emission coefficient factors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

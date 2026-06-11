import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { ShoppingBag, Heart, ShieldCheck, Tag, Info, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

export const Marketplace: React.FC = () => {
  const { products, transactions, token, fetchProducts, fetchTransactions, fetchProfile } = useStore();
  const { speak } = useAccessibility();

  // Category filter
  const [filterCategory, setFilterCategory] = useState<'all' | 'offset' | 'product'>('all');

  // Purchase overlay
  const [buyingProduct, setBuyingProduct] = useState<any | null>(null);
  const [fundingAmount, setFundingAmount] = useState(25.00);
  const [buyingStatus, setBuyingStatus] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  const handleBuyOffset = async () => {
    if (!buyingProduct) return;
    setBuyingStatus(true);
    speak(`Initiating offset purchase of ${fundingAmount} dollars for project ${buyingProduct.name}.`);

    try {
      await axios.post(`${API_URL}/marketplace/buy`, {
        productId: buyingProduct._id,
        amountPaid: Number(fundingAmount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      speak(`Purchase complete! Your offset has been registered. Check your dashboard for updated score level.`);
      setBuyingProduct(null);
      await fetchTransactions();
      await fetchProfile(); // Update header score
    } catch (err) {
      console.error(err);
      speak('Payment processing failed. Please verify points balance.');
    } finally {
      setBuyingStatus(false);
    }
  };

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Eco Offset Marketplace</h1>
        <p className="text-muted-foreground mt-1">Fund verified reforestation or purchase eco alternatives to balance carbon footprint.</p>
      </div>

      {/* Category Toggles */}
      <div className="flex gap-2.5 border-b pb-3 border-border">
        {(['all', 'offset', 'product'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilterCategory(cat);
              speak(`Showing ${cat} catalog items.`);
            }}
            className={`text-sm py-2 px-4 rounded-xl font-bold border capitalize transition-all duration-200 ${
              filterCategory === cat
                ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat === 'all' ? 'All products' : cat === 'offset' ? 'Carbon Offsets' : 'Eco Alternatives'}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div key={p._id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between glass-card group hover:scale-[1.01] transition-all duration-300">
            {/* Image placeholder */}
            <div className="h-44 w-full bg-secondary/50 relative overflow-hidden flex items-center justify-center">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              )}
              {p.isOffset && (
                <span className="absolute top-3 right-3 bg-primary text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full shadow-sm">
                  -{p.carbonSaved} kg CO₂
                </span>
              )}
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider">{p.category}</p>
                <h3 className="font-bold text-sm text-foreground mt-1 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{p.description}</p>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                  <span className="text-muted-foreground">Rating: ⭐ {p.rating} ({p.ratingCount})</span>
                  <span className="text-foreground font-extrabold text-sm">${p.price?.toFixed(2)}</span>
                </div>

                {p.isOffset ? (
                  <button
                    onClick={() => {
                      setBuyingProduct(p);
                      setFundingAmount(p.price);
                      speak(`Selected offset ${p.name}. Configure funding allocation.`);
                    }}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-primary/10"
                  >
                    Fund Offset Project
                  </button>
                ) : (
                  <a
                    href="https://amazon.com" target="_blank" rel="noreferrer"
                    className="w-full bg-secondary hover:bg-secondary/80 border border-border text-foreground py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    View Product
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm glass-card">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShieldCheck className="text-primary h-5 w-5" />
          Certified Offsets Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-muted-foreground uppercase tracking-wider font-semibold">
                <th className="pb-3 font-semibold">Project Name</th>
                <th className="pb-3 font-semibold">Verification Provider</th>
                <th className="pb-3 font-semibold">Amount Funded</th>
                <th className="pb-3 font-semibold">Carbon Capture</th>
                <th className="pb-3 font-semibold">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="pt-4 text-center text-muted-foreground">No transactions completed yet.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="border-b last:border-0 hover:bg-secondary/20 transition-all duration-150">
                    <td className="py-3 font-bold text-foreground">{t.projectName}</td>
                    <td className="py-3 text-muted-foreground">{t.provider}</td>
                    <td className="py-3 font-bold">${t.amountPaid?.toFixed(2)}</td>
                    <td className="py-3 font-bold text-emerald-500">-{t.carbonOffsetKg} kg CO₂</td>
                    <td className="py-3">
                      <a href={t.certificateUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">
                        Download PDF
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Modal overlay */}
      {buyingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 glass-card animate-in zoom-in duration-300">
            <h3 className="font-bold text-lg">Fund Carbon Capture</h3>
            <p className="text-xs text-muted-foreground">
              You are funding <strong>{buyingProduct.name}</strong> under verified provider <strong>{buyingProduct.provider}</strong>.
            </p>

            <div>
              <label htmlFor="fund-amount" className="text-xs font-semibold block mb-1">Funding Amount (USD)</label>
              <input
                id="fund-amount"
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Estimated Carbon offset: <strong className="text-emerald-500">-{Math.round(fundingAmount * 100)} kg CO₂</strong>
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setBuyingProduct(null)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyOffset}
                disabled={buyingStatus}
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/10"
              >
                {buyingStatus ? 'Processing payment...' : 'Confirm Funding'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

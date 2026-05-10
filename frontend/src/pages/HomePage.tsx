import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Truck, Shield, Headphones, Search, ArrowRight } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
  similarity?: number;
}

const FEATURE_ICONS = [
  { icon: Truck, label: 'Free Express Shipping', sub: 'On priority orders over $50' },
  { icon: Shield, label: 'Secure SSL Payments', sub: 'Military-grade encryption' },
  { icon: Sparkles, label: 'Curated Quality', sub: 'Handpicked premium gear' },
  { icon: Headphones, label: '24/7 Concierge Support', sub: 'Always here to assist you' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', debouncedSearch, activeCategory],
    queryFn: async () => {
      if (debouncedSearch) {
        // Hit the AI-powered search endpoint
        const { data } = await api.get('/products/search', { params: { q: debouncedSearch } });
        // Filter locally if a category is selected since AI searches the whole catalog
        if (activeCategory) {
          return data.filter((p: Product) => p.category === activeCategory);
        }
        return data;
      }
      
      // Standard fetch when no search term is entered
      const { data } = await api.get('/products', {
        params: { category: activeCategory || undefined },
      });
      return data;
    },
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['products', '', ''],
    queryFn: () => api.get('/products').then((r) => r.data),
    staleTime: 60_000,
  });
  
  const categories = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-[#0a0f1c] selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Hero Section — Premium aesthetic */}
      <section className="relative overflow-hidden pt-28 pb-32 px-6">
        {/* Abstract Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md mb-8 shadow-2xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 text-sm font-medium tracking-wide">The New Generation of Electronics</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-tight mb-6 tracking-tight">
            Elevate Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 flex items-center justify-center gap-2 to-cyan-400">
              Digital Lifestyle.
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Discover a curated collection of ultra-premium tech, masterful gadgets, and unparalleled accessories designed for true enthusiasts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="#products"
              className="group flex items-center gap-3 w-fit mx-auto bg-white text-slate-900 font-bold px-10 py-4 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 text-lg"
            >
              Shop Collection
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Feature strip — Glassmorphic */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {FEATURE_ICONS.map(({ icon: Icon, label, sub }, idx) => (
            <div key={label} className={`flex items-start gap-4 ${idx !== 0 ? 'pt-8 lg:pt-0 lg:pl-8' : ''}`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-bold mb-1 tracking-wide">{label}</p>
                <p className="text-slate-400 text-sm font-light leading-relaxed">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Trending Now</h2>
            <p className="text-slate-400 text-lg">
              {isLoading ? 'Loading masterworks…' : `Displaying ${products.length} superior items`}
            </p>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeCategory === ''
                  ? 'bg-white text-slate-900 shadow-lg shadow-white/20'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/40 border border-slate-700/50 rounded-3xl h-[400px] animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-slate-800/20 rounded-3xl border border-slate-800/50 border-dashed">
            <Search className="w-16 h-16 mb-6 opacity-20" />
            <p className="text-white font-bold text-2xl mb-2">No masterpieces found</p>
            <p className="text-slate-500 mb-8">Try adjusting your filters to discover more.</p>
            <button
              onClick={() => setActiveCategory('')}
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-indigo-500/20"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#060913] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            © {new Date().getFullYear()} nexShop Premium Technologies. Crafted with excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  Check,
  Star,
  ArrowLeft,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
}

const PERKS = [
  { icon: Truck,       label: 'Free Express Delivery', sub: 'On orders over $50' },
  { icon: ShieldCheck, label: 'Secure Checkout',        sub: 'SSL encrypted payment' },
  { icon: RotateCcw,   label: '30-Day Returns',         sub: 'Hassle-free policy' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Role check — same pattern as ProductCard / Navbar
  let isAdmin = false;
  try {
    const token = localStorage.getItem('access_token');
    if (token) isAdmin = jwtDecode<{ role: string }>(token).role === 'admin';
  } catch { /* ignore */ }

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const cartItem   = product ? items.find((i) => i.productId === product.id) : undefined;
  const inCart     = !!cartItem;
  const maxReached = !!cartItem && cartItem.quantity >= (product?.stockQuantity ?? 0);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      productId:  product.id,
      name:       product.name,
      price:      Number(product.price),
      imageUrl:   product.imageUrl,
      maxStock:   product.stockQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  /* ── Loading ───────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="bg-slate-800/50 rounded-3xl aspect-square" />
            <div className="space-y-6 pt-4">
              <div className="h-5 w-24 bg-slate-800 rounded-full" />
              <div className="h-10 w-3/4 bg-slate-800 rounded-2xl" />
              <div className="h-4 w-1/3 bg-slate-800 rounded-full" />
              <div className="h-24 bg-slate-800 rounded-2xl" />
              <div className="h-16 w-40 bg-slate-800 rounded-2xl" />
              <div className="h-14 bg-slate-800 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error / Not Found ─────────────────────────────────────────────── */
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#0a0f1c]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-slate-400">
          <AlertCircle className="w-16 h-16 mb-6 opacity-30" />
          <h2 className="text-2xl font-black text-white mb-2">Product not found</h2>
          <p className="text-slate-500 mb-8">This item may have been removed or doesn't exist.</p>
          <Link
            to="/"
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const outOfStock = product.stockQuantity === 0;

  /* ── Detail View ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#0a0f1c] selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '11s' }} />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10">
          <Link to="/" className="hover:text-indigo-400 transition-colors font-medium">Home</Link>
          <span>/</span>
          <span className="text-slate-400">{product.category}</span>
          <span>/</span>
          <span className="text-slate-300 font-semibold line-clamp-1">{product.name}</span>
        </nav>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

          {/* ── LEFT: Image ─────────────────────────────────────────── */}
          <div className="sticky top-24">
            {/* Main image card */}
            <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(79,70,229,0.25)] aspect-square flex items-center justify-center p-10 group">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

              {!imgError && product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="relative z-10 w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-500">
                  <Package className="w-24 h-24 opacity-20" />
                  <span className="text-sm font-medium opacity-40">No image available</span>
                </div>
              )}

              {/* Category badge */}
              <span className="absolute top-5 left-5 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                {product.category}
              </span>

              {/* Stock badge */}
              {outOfStock ? (
                <span className="absolute top-5 right-5 z-20 bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Out of Stock
                </span>
              ) : (
                <span className="absolute top-5 right-5 z-20 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  In Stock
                </span>
              )}
            </div>
          </div>

          {/* ── RIGHT: Details ───────────────────────────────────────── */}
          <div className="flex flex-col gap-7 pt-2">

            {/* Category pill — tiny label above the title */}
            <span className="inline-flex items-center w-fit text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-4 py-1.5 rounded-full">
              {product.category}
            </span>

            {/* ── 1. TITLE ─────────────────────────────────────────────
                  Largest element on the page — gradient white so it
                  pops off the dark background instantly.               */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400">
              {product.name}
            </h1>

            {/* ── 2. STARS & REVIEWS ───────────────────────────────── */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600 fill-slate-600'}`}
                  />
                ))}
              </div>
              <span className="text-white font-bold text-sm">4.0</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 text-sm">128 reviews</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-slate-700 via-slate-600 to-transparent" />

            {/* ── 3. PRICING ───────────────────────────────────────── */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-5xl font-black text-white tracking-tight">
                ${Number(product.price).toFixed(2)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-base line-through">
                  ${(Number(product.price) * 1.15).toFixed(2)}
                </span>
                <span className="text-emerald-400 text-sm font-black bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                  15% OFF
                </span>
              </div>
            </div>

            {/* ── 4. DESCRIPTION BOX ───────────────────────────────── */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                About this item
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Stock counter */}
            {!outOfStock && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  <span className="text-emerald-400 font-bold">{product.stockQuantity}</span> units left in stock
                </span>
              </div>
            )}

            {/* Add to Cart / Admin view */}
            {!isAdmin ? (
              <button
                onClick={handleAdd}
                disabled={outOfStock || maxReached}
                className={`group relative flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-base font-extrabold transition-all duration-300 overflow-hidden shadow-xl
                  ${added
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : outOfStock || maxReached
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                    : inCart
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-white/20'
                  }`}
              >
                {/* Shimmer on idle white button */}
                {!added && !outOfStock && !maxReached && !inCart && (
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                )}
                {added ? (
                  <><Check className="w-5 h-5" /> Added to Cart!</>
                ) : outOfStock ? (
                  <><Package className="w-5 h-5" /> Out of Stock</>
                ) : maxReached ? (
                  <><ShoppingCart className="w-5 h-5" /> Max Stock Reached</>
                ) : inCart ? (
                  <><ShoppingCart className="w-5 h-5" /> Add Another</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-2xl px-6 py-4">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                Admins cannot purchase products.
              </div>
            )}

            {/* Back link */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 text-sm font-medium transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to products
            </button>

            {/* Divider */}
            <div className="h-px bg-slate-800" />

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PERKS.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <p className="text-white text-xs font-bold">{label}</p>
                  <p className="text-slate-500 text-[11px]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

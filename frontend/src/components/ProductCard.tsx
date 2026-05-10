import { ShoppingCart, Check, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

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

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.some((i) => i.productId === product.id);

  // Decode role from JWT to conditionally hide shopping features for admins
  let isAdmin = false;
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = jwtDecode<{ role: string }>(token);
      isAdmin = decoded.role === 'admin';
    }
  } catch {
    // invalid / missing token — treat as regular visitor
  }

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      maxStock: product.stockQuantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden flex flex-col hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-2">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Clickable image area → navigates to product detail */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-slate-800/80 aspect-[4/3] w-full p-6 flex items-center justify-center cursor-pointer">
        {product.imageUrl ? (
          <>
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                e.currentTarget.nextElementSibling?.classList.add('flex');
              }}
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="hidden w-full h-full items-center justify-center text-slate-500 text-5xl">📦</div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-5xl">📦</div>
        )}
        
        {/* Category badge */}
        <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
          {product.category}
        </span>
      </Link>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-1 relative z-10 bg-slate-900/40 border-t border-slate-700/50">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/products/${product.id}`}>
            <h3 className="text-slate-100 font-bold text-base leading-tight line-clamp-2 group-hover:text-indigo-400 hover:text-indigo-400 transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating Mock */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
          ))}
          <span className="text-slate-500 text-[10px] ml-1 tracking-widest">(4.0)</span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 flex-1 mb-4">
          {product.description}
        </p>

        <div className="flex items-end justify-between mt-auto mb-4">
          <div className="flex flex-col">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Price</span>
            <span className="text-white font-extrabold text-xl">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
          {product.stockQuantity > 0 ? (
            <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md text-[10px] font-bold">In Stock</span>
          ) : (
            <span className="text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-md text-[10px] font-bold">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart — hidden for admins */}
        {!isAdmin && (
          <button
            onClick={handleAdd}
            disabled={product.stockQuantity === 0 || inCart && items.find(i => i.productId === product.id)?.quantity! >= product.stockQuantity}
            className={`relative w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden
              ${added
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : inCart
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/30'
                : 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added Successfully
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {product.stockQuantity === 0 ? 'Out of Stock' : (inCart && items.find(i => i.productId === product.id)?.quantity! >= product.stockQuantity ? 'Max Stock Reached' : (inCart ? 'Add Another' : 'Add to Cart'))}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

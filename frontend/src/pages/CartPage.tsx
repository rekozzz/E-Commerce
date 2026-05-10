import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total, count } = useCart();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
      return;
    }
    setOrdering(true);
    setError('');
    try {
      await api.post('/orders', {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
        })),
        total: parseFloat(total.toFixed(2)),
      });
      clearCart();
      setSuccess(true);
    } catch {
      setError('Failed to place order. Please sign in and try again.');
    } finally {
      setOrdering(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0f1c]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed! 🎉</h2>
          <p className="text-slate-400 mb-8">Thanks for your purchase. We'll process it right away.</p>
          <Link
            to="/"
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-indigo-500/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
          <span className="text-slate-400 text-sm">({count} item{count !== 1 ? 's' : ''})</span>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-800/20 backdrop-blur-md rounded-3xl border border-slate-700/50 border-dashed">
            <ShoppingBag className="w-16 h-16 text-slate-600 mb-6" />
            <p className="text-white font-bold text-2xl mb-2">Your cart is empty</p>
            <p className="text-slate-400 mb-8">It looks like you haven't added any masterworks yet.</p>
            <Link
              to="/"
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-indigo-500/20"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const unitPrice = Number(item.price);
                const lineTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="flex gap-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600 transition-all"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-700">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm line-clamp-1">{item.name}</p>
                      <p className="text-amber-400 font-bold mt-1">${unitPrice.toFixed(2)}</p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white font-semibold w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal + Remove */}
                    <div className="flex flex-col items-end justify-between shrink-0">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-white font-bold text-sm">
                        ${lineTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 sticky top-20">
                <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-white font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                    {error}
                  </p>
                )}

                <button
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={ordering}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 mt-2"
                >
                  {ordering ? 'Processing Securely...' : 'Complete Checkout'}
                </button>

                <p className="text-center text-slate-500 text-xs mt-3">
                  🔒 Secure checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

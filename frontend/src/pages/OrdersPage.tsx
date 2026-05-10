import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

interface OrderItem {
  id: number;
  productId: number;
  name: string;
  price: string | number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: number;
  total: string | number;
  status: string; // "pending" from database
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const navigate = useNavigate();

  // If no auth token, redirect
  if (!localStorage.getItem('access_token')) {
    navigate('/login');
    return null;
  }

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then((res) => res.data),
  });

  return (
    <div className="min-h-screen bg-[#0a0f1c]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Your Orders</h1>
        <p className="text-slate-400 mb-12">Track and manage your order history.</p>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-slate-800/40 border border-slate-700/50 rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-800/20 backdrop-blur-md rounded-3xl border border-slate-700/50 border-dashed">
            <Package className="w-16 h-16 text-slate-600 mb-6" />
            <p className="text-white font-bold text-2xl mb-2">No orders yet</p>
            <p className="text-slate-400 mb-8">It looks like you haven't placed any orders with us. Discover our masterworks!</p>
            <Link
              to="/"
              className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-3 rounded-full transition-all shadow-lg shadow-indigo-500/20"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              // Simulate Delivery lifecycle logic for a "professional" feel:
              // Estimate delivery to 3 days after creation.
              const orderDate = new Date(order.createdAt);
              const deliveryDate = new Date(orderDate);
              deliveryDate.setDate(orderDate.getDate() + 3);
              const isDelivered = new Date() > deliveryDate;

              return (
                <div
                  key={order.id}
                  className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-600"
                >
                  {/* Order Header */}
                  <div className="bg-slate-800/50 p-6 border-b border-slate-700/50 flex flex-wrap gap-y-4 items-center justify-between">
                    <div className="flex flex-wrap gap-8 sm:gap-16">
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Date Placed</p>
                        <p className="text-white font-semibold">{orderDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Total</p>
                        <p className="text-white font-semibold">${Number(order.total).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase mb-1">Order Number</p>
                        <p className="text-white font-semibold">#{order.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    {/* Status Tracker */}
                    <div className="mb-8">
                      {isDelivered ? (
                        <div className="flex items-center gap-3 text-emerald-400">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">Delivered on {deliveryDate.toLocaleDateString()}</p>
                            <p className="text-emerald-500/70 text-sm">Your package was left at the front door.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-amber-400">
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">In Transit</p>
                            <p className="text-amber-500/70 text-sm">Estimated delivery: {deliveryDate.toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex gap-6 group items-center">
                          <div className="w-24 h-24 bg-[#060913] rounded-2xl overflow-hidden shrink-0 border border-slate-700/50 group-hover:border-slate-500 transition-colors p-2">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain drop-shadow-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl">📦</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-bold text-lg leading-tight line-clamp-1 mb-1 group-hover:text-indigo-400 transition-colors">{item.name}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                              <span className="font-medium text-slate-300">Qty: {item.quantity}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                              <span className="font-bold text-white">${Number(item.price).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

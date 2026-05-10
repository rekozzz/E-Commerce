import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Settings, Plus, Package, Edit2, AlertCircle, Save, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrl?: string;
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products-admin'],
    queryFn: () => api.get('/products').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.post('/products', data),
    onSuccess: () => {
      setSuccess('Product added successfully!');
      setError('');
      reset();
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      setError(
        msg
          ? (Array.isArray(msg) ? msg.join(', ') : msg)
          : 'Failed to add product.'
      );
      setSuccess('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stockQuantity }: { id: number; stockQuantity: number }) =>
      api.patch(`/products/${id}`, { stockQuantity }),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  const handleSaveStock = (id: number) => {
    updateStockMutation.mutate({ id, stockQuantity: editStockValue });
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] selection:bg-indigo-500/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" />
          Admin Dashboard
        </h1>
        <p className="text-slate-400 mb-10">Manage inventory, add new products, and configure store stock.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Add Product
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="E.g. Gaming Mouse"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category Menu</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select a category...</option>
                    {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { required: 'Required', min: { value: 0, message: 'Price cannot be negative' } })}
                      className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-colors"
                    />
                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Stock</label>
                    <input
                      type="number"
                      {...register('stockQuantity', { required: 'Required', min: { value: 0, message: 'Stock cannot be negative' } })}
                      className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 transition-colors"
                    />
                    {errors.stockQuantity && <p className="mt-1 text-xs text-red-500">{errors.stockQuantity.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Image URL</label>
                  <input
                    {...register('imageUrl')}
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="https://unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                {success && (
                  <div className="text-emerald-400 text-sm bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 font-bold text-center">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add to Catalog'}
                </button>
              </form>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" /> Inventory Management
              </h2>

              <div className="bg-[#060913] rounded-2xl border border-slate-800 overflow-hidden flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading inventory...</td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No products found. Add one!</td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">#{p.id}</td>
                          <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                          <td className="px-6 py-4">${Number(p.price).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            {editingId === p.id ? (
                              <input
                                type="number"
                                min={0}
                                value={editStockValue}
                                onChange={(e) => setEditStockValue(Number(e.target.value))}
                                className="w-20 bg-slate-800 border border-indigo-500 text-white px-2 py-1 space-x-1 rounded-md text-sm focus:outline-none"
                                autoFocus
                              />
                            ) : (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${
                                p.stockQuantity === 0 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : p.stockQuantity < 10 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {p.stockQuantity} in stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingId === p.id ? (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveStock(p.id)}
                                  disabled={updateStockMutation.isPending}
                                  className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  <Save className="w-4 h-4" /> Save
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this product?')) {
                                      deleteMutation.mutate(p.id);
                                    }
                                  }}
                                  className="flex items-center gap-1 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(p.id);
                                    setEditStockValue(p.stockQuantity);
                                  }}
                                  className="flex items-center gap-1 text-slate-400 hover:text-white"
                                >
                                  <Edit2 className="w-4 h-4" /> Edit Stock
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

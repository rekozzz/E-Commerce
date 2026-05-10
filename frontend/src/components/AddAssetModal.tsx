import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Package } from 'lucide-react';
import api from '../api/axios';

interface FormData {
  name: string;
  category: string;
  serialNumber: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  purchaseDate: string;
  value: number;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ['Electronics', 'Furniture', 'Vehicle', 'Software', 'Equipment', 'Other'];

export default function AddAssetModal({ onClose, onSuccess }: Props) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { status: 'Active' } });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await api.post('/assets', { ...data, value: Number(data.value) });
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.message ?? 'Failed to create asset');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[fadeInScale_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add New Asset</h2>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Asset Name *</label>
              <input
                id="asset-name"
                className={`w-full bg-slate-700/60 border ${errors.name ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder="e.g. MacBook Pro 16"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
              <select
                id="asset-category"
                className={`w-full bg-slate-700/60 border ${errors.category ? 'border-red-500' : 'border-slate-600'} text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select
                id="asset-status"
                className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                {...register('status')}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Serial Number *</label>
              <input
                id="asset-serial"
                className={`w-full bg-slate-700/60 border ${errors.serialNumber ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder="SN-001234"
                {...register('serialNumber', { required: 'Serial Number is required' })}
              />
              {errors.serialNumber && <p className="mt-1 text-xs text-red-400">{errors.serialNumber.message}</p>}
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Purchase Date</label>
              <input
                id="asset-date"
                type="date"
                className="w-full bg-slate-700/60 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                {...register('purchaseDate')}
              />
            </div>

            {/* Value */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Value (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  id="asset-value"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-700/60 border border-slate-600 text-white placeholder-slate-400 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="0.00"
                  {...register('value', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {serverError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              id="submit-asset-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? 'Saving...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

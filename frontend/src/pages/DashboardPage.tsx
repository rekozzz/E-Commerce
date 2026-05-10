import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Package,
  CheckCircle,
  XCircle,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import api from '../api/axios';
import AddAssetModal from '../components/AddAssetModal';

interface Asset {
  id: number;
  name: string;
  category: string;
  serialNumber: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  purchaseDate: string;
  value: number;
  createdAt: string;
}

const statusConfig = {
  Active: { label: 'Active', className: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20', icon: CheckCircle },
  Inactive: { label: 'Inactive', className: 'bg-slate-500/15 text-slate-400 ring-slate-500/20', icon: XCircle },
  Maintenance: { label: 'Maintenance', className: 'bg-amber-500/15 text-amber-400 ring-amber-500/20', icon: Wrench },
};

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const { label, className, icon: Icon } = statusConfig[status] ?? statusConfig['Inactive'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets').then((r) => r.data),
  });

  const logout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const activeCount = assets.filter((a) => a.status === 'Active').length;
  const inactiveCount = assets.filter((a) => a.status === 'Inactive').length;
  const totalValue = assets.reduce((sum, a) => sum + Number(a.value), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AssetFlow</span>
          </div>
          <button
            id="logout-btn"
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700/50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Asset Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage and track all your company assets</p>
          </div>
          <button
            id="add-asset-btn"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Total Assets" value={assets.length} color="bg-blue-500/15 text-blue-400" />
          <StatCard icon={CheckCircle} label="Active" value={activeCount} color="bg-emerald-500/15 text-emerald-400" />
          <StatCard icon={XCircle} label="Inactive" value={inactiveCount} color="bg-slate-500/15 text-slate-400" />
          <StatCard icon={TrendingUp} label="Total Value" value={totalValue} color="bg-violet-500/15 text-violet-400" />
        </div>

        {/* Table */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Asset Inventory</h2>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">{assets.length} items</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <div className="animate-spin w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full mr-3" />
              Loading assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium text-slate-300">No assets yet</p>
              <p className="text-sm mt-1">Click "Add Asset" to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['Name', 'Category', 'Serial Number', 'Status', 'Purchase Date', 'Value'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-6 py-4 text-white font-medium">{asset.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 bg-slate-700/40 px-2.5 py-0.5 rounded-lg text-xs">{asset.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">{asset.serialNumber}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-semibold">
                        {Number(asset.value) > 0 ? `$${Number(asset.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <AddAssetModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['assets'] })}
        />
      )}
    </div>
  );
}

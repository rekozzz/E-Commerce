import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Package, LogOut, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
}

interface NavbarProps {
  /** Current search term (lifted from HomePage, optional) */
  searchTerm?: string;
  /** Called when user types in the nav search box */
  onSearchChange?: (value: string) => void;
}

export default function Navbar({ searchTerm = '', onSearchChange }: NavbarProps) {
  const { count } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const isLoggedIn = !!token;

  let isAdmin = false;
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      isAdmin = decoded.role === 'admin';
    } catch {
      // invalid token
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700/60 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group" id="nav-logo">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-white drop-shadow-md" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
            nexShop
          </span>
        </Link>

        {/* Search Bar — wired to HomePage search state when on / */}
        <div className="flex-1 flex items-center bg-slate-800 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all mx-2">
          <input
            id="nav-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm px-4 py-2.5 focus:outline-none"
          />
          <button className="px-4 bg-indigo-500 hover:bg-indigo-400 h-full text-white flex items-center justify-center transition-colors self-stretch">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isLoggedIn ? (
            <>
              {!isAdmin && (
                <Link
                  to="/orders"
                  id="nav-orders"
                  className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-700/60 transition-all"
                >
                  <Package className="w-4 h-4" />
                  Orders
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  id="nav-admin"
                  className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-700/60 transition-all"
                >
                  <User className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-700/60 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              id="nav-signin"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-700/60 transition-all"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block">Sign In</span>
            </Link>
          )}

          {/* Cart — hidden for admins */}
          {!isAdmin && (
            <Link
              to="/cart"
              id="nav-cart"
              className="relative flex items-center gap-1.5 text-white bg-indigo-500 hover:bg-indigo-400 px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:block">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

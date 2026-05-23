import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ThemeContext } from '../../context/ThemeContext.jsx';
import { Sun, Moon, Bookmark, LogOut, LayoutDashboard, User, Menu, X, Library } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass shadow-sm transition-all duration-300 dark:border-b dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl tracking-tight">
              <Library className="w-6 h-6 stroke-[2.5]" />
              <span>CUJ <span className="text-slate-800 dark:text-white font-semibold">PYQ</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              Home
            </Link>
            <Link to="/departments" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
              Browse Departments
            </Link>
            {user && (
              <Link to="/saved" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
              </Link>
            )}
            {user && (
              <Link to="/upload" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                Upload Paper
              </Link>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl bg-slate-100 dark:bg-slate-900 transition-all hover:scale-105"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-4 h-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged in</p>
                    <p className="text-sm font-semibold max-w-[120px] truncate text-slate-800 dark:text-slate-200">{user.name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 transition-all hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 rounded-lg bg-slate-100 dark:bg-slate-900 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-lg bg-slate-100 dark:bg-slate-900 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-slate-200/50 dark:border-slate-900/50 px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
          >
            Home
          </Link>
          <Link
            to="/departments"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
          >
            Browse Departments
          </Link>
          {user && (
            <Link
              to="/saved"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
            >
              Bookmarks
            </Link>
          )}
          {user && (
            <Link
              to="/upload"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
            >
              Upload Paper
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-900/50">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 h-10 border border-slate-250 dark:border-slate-800 text-red-500 rounded-xl text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-3 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 flex items-center justify-center border border-slate-250 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

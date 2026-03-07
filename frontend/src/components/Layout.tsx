import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Vote, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout, signed } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="navbar bg-base-100 shadow-md px-4 sm:px-8">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl gap-2">
            <Vote className="text-primary" />
            <span className="font-bold tracking-tight">OpenVote</span>
          </Link>
        </div>
        <div className="flex-none gap-2">
          {signed && user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
                <li className="menu-title px-4 py-2 opacity-60">Olá, {user?.name}</li>
                {user?.role === 'admin' && (
                  <li>
                    <Link to="/admin" className="gap-2">
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className="gap-2 text-error">
                    <LogOut size={16} /> Sair
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Entrar</Link>
          )}
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="footer footer-center p-4 bg-base-100 text-base-content border-t border-base-300">
        <aside>
          <p>© 2026 OpenVote - Votação Transparente</p>
        </aside>
      </footer>
    </div>
  );
};

export default Layout;

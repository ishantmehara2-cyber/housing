import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldAlert, Lock, Mail, Loader2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login({ identifier: email, password });
      setAuth(res.user, res.accessToken);

      const isAdmin = res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN' || res.user.role === 'MODERATOR';
      if (!isAdmin) {
        setError('This portal is restricted exclusively to platform administrators.');
        return;
      }

      navigate('/admin');
    } catch {
      setError('Invalid administrator email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="bg-red-900/50 text-red-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-red-500/30">
            Administrative Portal
          </span>
          <h1 className="text-2xl font-black text-white">Admin Sign In</h1>
          <p className="text-xs text-gray-400 font-medium">Access platform moderation, broker creation, and system audit logs</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Admin Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.test"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-semibold text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 font-semibold text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Administrator...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-700 text-center text-xs text-gray-400 flex justify-between">
          <Link to="/auth/login" className="hover:underline">User Login</Link>
          <Link to="/broker/login" className="hover:underline">Broker Login</Link>
        </div>
      </div>
    </div>
  );
};

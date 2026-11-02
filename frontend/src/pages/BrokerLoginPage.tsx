import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { Building2, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export const BrokerLoginPage: React.FC = () => {
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

      const isBroker = res.user.role === 'AGENT' || res.user.role === 'DEVELOPER' || res.user.role === 'OWNER';
      if (!isBroker) {
        setError('This portal is reserved for registered property brokers and agents.');
        return;
      }

      navigate('/broker/dashboard');
    } catch {
      setError('Invalid broker email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="bg-brand-50 text-brand-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-brand-200">
            Broker & Partner Portal
          </span>
          <h1 className="text-2xl font-black text-gray-900">Broker Partner Sign In</h1>
          <p className="text-xs text-gray-500 font-medium">Access your agency listings, direct buyer leads, and visit requests</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Broker Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@example.test"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Broker...</span>
              </>
            ) : (
              <span>Sign In to Broker Portal</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500 space-y-2">
          <p className="flex items-center justify-center space-x-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin-created agency accounts only</span>
          </p>
          <div className="flex justify-between items-center pt-2">
            <Link to="/auth/login" className="text-gray-600 hover:underline">User Login</Link>
            <Link to="/admin/login" className="text-red-600 font-bold hover:underline">Admin Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

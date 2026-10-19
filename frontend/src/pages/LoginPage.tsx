import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput, Role } from '@housing-clone/shared';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect');

  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const handleFillSuperAdmin = () => {
    setValue('identifier', 'housing.com');
    setValue('password', 'housing@123');
    setServerError(null);
  };

  const onSubmit = async (data: LoginInput) => {
    try {
      setServerError(null);
      const res = await authService.login(data);
      setAuth(res.user, res.accessToken);

      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (
        res.user.role === Role.ADMIN ||
        res.user.role === Role.SUPER_ADMIN ||
        res.user.role === Role.MODERATOR
      ) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resErr = (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error;
        setServerError(resErr?.message || 'Invalid credentials. Please try again.');
      } else {
        setServerError('Connection error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500">Log in to manage your property listings, enquiries & admin control center</p>
        </div>

        {/* Quick Demo Super Admin Fill Button */}
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-4 h-4 text-brand-primary shrink-0" />
            <div>
              <p className="font-bold text-gray-900">Super Admin Demo:</p>
              <p className="text-[11px] text-gray-500">housing.com / housing@123</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillSuperAdmin}
            className="bg-brand-primary hover:bg-brand-hover text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition shrink-0"
          >
            Fill Demo Login
          </button>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email / Phone</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                {...register('identifier')}
                placeholder="housing.com or email@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition text-sm"
              />
            </div>
            {errors.identifier && <p className="text-xs text-red-600 mt-1">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition text-sm"
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-brand-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

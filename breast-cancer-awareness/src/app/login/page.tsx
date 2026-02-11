'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';
import { LiquidButton, GlassButton } from '@/components/ui/liquid-glass-button';
import { LogIn, UserPlus, Mail, Lock, User, Stethoscope, Heart, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, loginAs, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await signup(email, password, name, role);
        if (result.success) {
          setError('');
          setMode('login');
          alert('Account created! Please check your email to verify, then login.');
        } else {
          setError(result.error || 'Signup failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole: UserRole) => {
    loginAs(demoRole);
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-pink-900">Welcome to Sangini</h1>
          <p className="text-pink-600 mt-2">
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Login/Signup Form */}
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-pink-200/50 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'patient', label: 'Patient', icon: User },
                    { value: 'doctor', label: 'Doctor', icon: Stethoscope },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value as UserRole)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        role === opt.value
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-pink-200 text-pink-500 hover:border-pink-300'
                      }`}
                    >
                      <opt.icon className="h-5 w-5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <LiquidButton type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </LiquidButton>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="text-sm text-pink-600 hover:text-pink-700 underline"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Demo Login Section */}
        <div className="mt-6 bg-white/50 backdrop-blur-md rounded-2xl border border-pink-200/50 p-6">
          <p className="text-center text-sm text-pink-600 mb-4 font-medium">
            Quick Demo Access (No account needed)
          </p>
          <div className="grid grid-cols-3 gap-3">
            <GlassButton onClick={() => handleDemoLogin('patient')} className="flex flex-col items-center gap-1 py-3">
              <User className="h-5 w-5" />
              <span className="text-xs">Patient</span>
            </GlassButton>
            <GlassButton onClick={() => handleDemoLogin('doctor')} className="flex flex-col items-center gap-1 py-3">
              <Stethoscope className="h-5 w-5" />
              <span className="text-xs">Doctor</span>
            </GlassButton>
            <GlassButton onClick={() => handleDemoLogin('admin')} className="flex flex-col items-center gap-1 py-3">
              <Shield className="h-5 w-5" />
              <span className="text-xs">Admin</span>
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}

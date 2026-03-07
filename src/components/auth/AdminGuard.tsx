'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';

const ADMIN_HASH_KEY = 'maloune_admin_session';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const session = sessionStorage.getItem(ADMIN_HASH_KEY);
    if (session) {
      const expires = parseInt(session);
      if (Date.now() < expires) {
        setAuthenticated(true);
      } else {
        sessionStorage.removeItem(ADMIN_HASH_KEY);
      }
    }
    setChecking(false);
  }, []);

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Session valid for 2 hours
        sessionStorage.setItem(ADMIN_HASH_KEY, String(Date.now() + 2 * 60 * 60 * 1000));
        setAuthenticated(true);
      } else {
        setError('Mot de passe incorrect');
      }
    } catch {
      setError('Erreur de connexion');
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Zone Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Accès restreint — authentification requise</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleLogin}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Accéder
            </button>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

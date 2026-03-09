'use client';
import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie.includes('cookie_consent=');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    document.cookie = 'cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax';
    setShow(false);
  };

  const decline = () => {
    document.cookie = 'cookie_consent=declined; max-age=31536000; path=/; SameSite=Lax';
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="container-shop">
        <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/10">
          <Cookie className="w-8 h-8 text-orange-400 flex-shrink-0 hidden sm:block" />
          <div className="flex-1">
            <p className="text-sm leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{' '}
              <a href="/fr/politique-confidentialite" className="text-orange-400 underline hover:text-orange-300">politique de confidentialité</a>.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={decline} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
              Refuser
            </button>
            <button onClick={accept} className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-lg shadow-orange-500/25">
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


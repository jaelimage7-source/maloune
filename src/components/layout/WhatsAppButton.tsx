'use client';
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const phone = '33600000000';
  const message = encodeURIComponent('Bonjour ! Je voudrais des informations sur Maloune.');

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-gray-900">Support Maloune</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Besoin d&apos;aide ? Nous répondons en moins de 24h !</p>
          <a href={`https://wa.me/${phone}?text=${message}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors">
            <MessageCircle className="w-5 h-5" /> Démarrer une conversation
          </a>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl shadow-green-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Contacter sur WhatsApp">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Send, Loader2, CheckCircle, Lock, Truck, RotateCcw, Headphones } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [nlStatus, setNlStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNlStatus('sending');
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (res.ok) { setNlStatus('sent'); setEmail(''); } else setNlStatus('error');
    } catch { setNlStatus('error'); }
  };

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="border-b border-white/5 py-8">
        <div className="container-shop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Lock, text: 'Paiement sécurisé', sub: 'SSL & myPOS' },
              { icon: Truck, text: 'Livraison mondiale', sub: 'Suivi inclus' },
              { icon: RotateCcw, text: 'Retour 14 jours', sub: 'Satisfait ou remboursé' },
              { icon: Headphones, text: 'Support réactif', sub: 'Sous 48h' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0"><b.icon className="w-4 h-4 text-orange-400" /></div>
                <div><p className="text-xs font-semibold text-white">{b.text}</p><p className="text-[11px] text-gray-500">{b.sub}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container-shop pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4"><Image src="/images/logo-footer.png" alt="MALOUNE" width={200} height={75} className="h-14 w-auto" /></Link>
            <p className="text-sm leading-relaxed mb-5 max-w-sm">Votre boutique en ligne de confiance. Produits tendance livrés chez vous.</p>
            <div className="max-w-sm">
              <p className="text-sm font-semibold text-white mb-2">Recevez nos offres exclusives</p>
              {nlStatus === 'sent' ? (
                <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> Inscription confirmée !</div>
              ) : (
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-none" />
                  <button onClick={handleNewsletter} disabled={nlStatus === 'sending' || !email}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center">
                    {nlStatus === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">f</a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">ig</a>
              <a href="#" className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors text-sm">tt</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Boutique</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Tous les produits</Link></li>
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">Nouveautés</Link></li>
              <li><Link href="/account" className="hover:text-orange-400 transition-colors">Mon compte</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Aide</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-orange-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Nous contacter</Link></li>
              <li><Link href="/politique-remboursement" className="hover:text-orange-400 transition-colors">Retours</Link></li>
              <li><a href="mailto:contact@maloune.fr" className="hover:text-orange-400 transition-colors">contact@maloune.fr</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Légal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-orange-400 transition-colors">Mentions légales</Link></li>
              <li><Link href="/conditions-generales" className="hover:text-orange-400 transition-colors">CGV</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-orange-400 transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; {year} MALOUNE — Pierre-Louis LAGUERRE (EI) — SIREN 528 266 729</p>
          <div className="flex items-center gap-2">
            {['myPOS', 'Visa', 'Mastercard', 'CB'].map(p => <span key={p} className="text-xs bg-white/5 px-2.5 py-1 rounded border border-white/10">{p}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}


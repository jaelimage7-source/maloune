'use client';
import { useState } from 'react';
import { Send, Mail, MapPin, Clock, CheckCircle, Loader2, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', orderNumber: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setStatus('sent'); setForm({ name: '', email: '', subject: '', orderNumber: '', message: '' }); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16">
        <div className="container-shop text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contactez-nous</h1>
          <p className="text-gray-600 max-w-lg mx-auto">Une question ? Notre équipe est là pour vous aider.</p>
        </div>
      </section>
      <section className="container-shop py-12 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-4">
            {[
              { icon: Mail, title: 'Email', text: 'contact@maloune.fr', sub: 'Réponse sous 48h' },
              { icon: MessageCircle, title: 'WhatsApp', text: 'Envoyez un message', sub: 'Réponse rapide' },
              { icon: MapPin, title: 'Adresse', text: '19 Av. Dr Fleming', sub: '92600 Asnières-sur-Seine' },
              { icon: Clock, title: 'Horaires', text: 'Lun - Ven : 9h - 18h', sub: 'Fermé le week-end' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 text-orange-500" /></div>
                  <div><h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3><p className="text-sm text-gray-700">{item.text}</p><p className="text-xs text-gray-400">{item.sub}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            {status === 'sent' ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h2>
                <p className="text-gray-600 mb-6">Un email de confirmation vous a été envoyé.</p>
                <button onClick={() => setStatus('idle')} className="btn-outline text-sm">Envoyer un autre message</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Envoyez-nous un message</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label><input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input" placeholder="Jean Dupont" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input" placeholder="jean@exemple.fr" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet</label>
                      <select value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} className="input">
                        <option value="">Sélectionnez</option><option value="Commande">Commande</option><option value="Produit">Produit</option><option value="Livraison">Livraison</option><option value="Retour">Retour</option><option value="Autre">Autre</option>
                      </select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">N° commande</label><input type="text" value={form.orderNumber} onChange={e => setForm(f => ({...f, orderNumber: e.target.value}))} className="input" placeholder="MAL-XXXX" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label><textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} className="input min-h-[140px] resize-y" placeholder="Votre message..." /></div>
                  {status === 'error' && <p className="text-sm text-red-500">Erreur. Réessayez ou envoyez un email directement.</p>}
                  <button onClick={handleSubmit} disabled={status === 'sending' || !form.name || !form.email || !form.message} className="btn-primary text-sm">
                    {status === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Envoi...</> : <><Send className="w-4 h-4 mr-2" />Envoyer</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}


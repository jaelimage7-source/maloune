'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';
import { CreditCard, Lock, ChevronLeft, Check, Truck, Package, Loader2, ShieldCheck, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '', country: 'FR',
  });

  const shipping = totalPrice() > 50 ? 0 : 4.99;
  const total = totalPrice() + shipping;

  const updateForm = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!form.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!form.email.trim() || !form.email.includes('@')) newErrors.email = 'Email valide requis';
    if (!form.address.trim()) newErrors.address = 'Adresse requise';
    if (!form.city.trim()) newErrors.city = 'Ville requise';
    if (!form.zip.trim()) newErrors.zip = 'Code postal requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) setStep(2);
  };

  const handlePayment = () => {
    setLoading(true);
    // Save shipping info to localStorage for order tracking
    localStorage.setItem('maloune_shipping', JSON.stringify(form));
    // Submit to myPOS via API
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <Link href="/products" className="btn-primary">Voir les produits</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-shop py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: 'Livraison', icon: Truck },
            { num: 2, label: 'Paiement', icon: CreditCard },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.num ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {s.num < 2 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" /> Adresse de livraison
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Prénom *</label>
                    <input value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)}
                      className={`input ${errors.firstName ? 'border-red-500' : ''}`} placeholder="Jean" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nom *</label>
                    <input value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)}
                      className={`input ${errors.lastName ? 'border-red-500' : ''}`} placeholder="Dupont" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                    <input value={form.email} onChange={(e) => updateForm('email', e.target.value)}
                      className={`input ${errors.email ? 'border-red-500' : ''}`} type="email" placeholder="jean@email.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone</label>
                    <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)}
                      className="input" placeholder="+33 6 12 34 56 78" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse *</label>
                    <input value={form.address} onChange={(e) => updateForm('address', e.target.value)}
                      className={`input ${errors.address ? 'border-red-500' : ''}`} placeholder="123 rue de la Paix" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ville *</label>
                    <input value={form.city} onChange={(e) => updateForm('city', e.target.value)}
                      className={`input ${errors.city ? 'border-red-500' : ''}`} placeholder="Paris" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Code postal *</label>
                    <input value={form.zip} onChange={(e) => updateForm('zip', e.target.value)}
                      className={`input ${errors.zip ? 'border-red-500' : ''}`} placeholder="75001" />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pays</label>
                    <select value={form.country} onChange={(e) => updateForm('country', e.target.value)} className="input">
                      <option value="FR">France</option>
                      <option value="HT">Haïti</option>
                      <option value="GP">Guadeloupe</option>
                      <option value="MQ">Martinique</option>
                      <option value="GF">Guyane</option>
                      <option value="RE">Réunion</option>
                      <option value="CA">Canada</option>
                      <option value="US">États-Unis</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleContinue} className="btn-primary w-full py-3.5 mt-6">
                  Continuer vers le paiement
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" /> Paiement sécurisé
                </h2>

                {/* Shipping summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-1">Livraison à</p>
                  <p className="text-gray-900 font-medium">{form.firstName} {form.lastName}</p>
                  <p className="text-gray-600 text-sm">{form.address}, {form.zip} {form.city}</p>
                  <p className="text-gray-600 text-sm">{form.email}</p>
                  <button onClick={() => setStep(1)} className="text-orange-500 text-sm mt-2 hover:underline">
                    Modifier l&apos;adresse
                  </button>
                </div>

                {/* Order items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image?.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl flex items-center justify-center h-full">{item.image || '📦'}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                {/* Hidden form for myPOS */}
                <form ref={formRef} method="POST" action="/api/checkout" style={{ display: 'none' }}>
                  <input type="hidden" name="data" value={JSON.stringify({
                    items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
                    locale,
                    shipping: form,
                  })} />
                </form>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Retour
                  </button>
                  <button onClick={handlePayment} disabled={loading}
                    className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Payer {total.toFixed(2)} €</>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Paiement sécurisé par myPOS — Visa, Mastercard</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">{t('cart.summary')}</h3>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="font-medium flex-shrink-0">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-gray-500">{t('common.shipping')}</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">{t('common.total')}</span>
                  <span className="font-bold text-xl text-gray-900">{total.toFixed(2)} €</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" /> Paiement 100% sécurisé
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';
import { CreditCard, Lock, ChevronLeft, Check, Truck, Loader2, ShieldCheck, MapPin } from 'lucide-react';

export default function CheckoutPage() {
  const t = useTranslations();
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '', country: 'FR',
  });

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

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
    try {
      localStorage.setItem('maloune_shipping', JSON.stringify(form));
    } catch (e) { /* ignore */ }
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  // Show loading while Zustand hydrates
  if (!hydrated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <Link href="/products" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600">
            Voir les produits
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              Livraison
            </span>
            <div className={`w-16 h-1 rounded ${step > 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              Paiement
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* STEP 1: ADDRESS FORM */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Adresse de livraison
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Jean"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Dupont"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="jean@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="123 rue de la Paix"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateForm('city', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Paris"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={(e) => updateForm('zip', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.zip ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="75001"
                    />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <select
                      value={form.country}
                      onChange={(e) => updateForm('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
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

                <button
                  onClick={handleContinue}
                  className="w-full mt-6 bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
                >
                  Continuer vers le paiement <Truck className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* STEP 2: REVIEW + PAY */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  Paiement sécurisé
                </h2>

                {/* Shipping summary */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Livraison à</p>
                      <p className="text-gray-900 font-semibold">{form.firstName} {form.lastName}</p>
                      <p className="text-gray-600 text-sm">{form.address}</p>
                      <p className="text-gray-600 text-sm">{form.zip} {form.city}</p>
                      <p className="text-gray-600 text-sm">{form.email}</p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-orange-500 text-sm font-medium hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-gray-500">Articles ({items.length})</p>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border flex-shrink-0 flex items-center justify-center">
                        {item.image?.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{item.image || '📦'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                {/* Hidden form for myPOS */}
                <form ref={formRef} method="POST" action="/api/checkout" style={{ display: 'none' }}>
                  <input type="hidden" name="data" value={JSON.stringify({
                    items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, productId: i.productId || undefined, variantId: i.variantId || undefined, image: i.image || undefined })),
                    locale,
                    shipping: form,
                  })} />
                </form>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft className="w-5 h-5" /> Retour
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex-[2] py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
                    ) : (
                      <><Lock className="w-5 h-5" /> Payer {total.toFixed(2)} €</>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Paiement sécurisé par myPOS — Visa, Mastercard, Google Pay
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR: Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-2">{item.name} ×{item.quantity}</span>
                    <span className="font-medium flex-shrink-0">{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {shipping === 0 ? 'Gratuit' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{total.toFixed(2)} €</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" /> 100% sécurisé
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

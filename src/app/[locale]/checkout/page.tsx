'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/store';
import { CreditCard, Lock, ChevronLeft, Check, Truck, Package } from 'lucide-react';

export default function CheckoutPage() {
  const t = useTranslations();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '', country: 'FR',
  });

  const shipping = totalPrice() > 50 ? 0 : 4.99;
  const total = totalPrice() + shipping;

  const updateForm = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !orderPlaced) {
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

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('common.orderConfirmed')}</h1>
          <p className="text-gray-600 mb-2">Merci pour votre commande !</p>
          <p className="text-gray-500 text-sm mb-8">Vous recevrez un email de confirmation avec les détails de suivi.</p>
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
            <p className="text-sm text-gray-500">Numéro de commande</p>
            <p className="font-bold text-lg text-gray-900">MAL-{Date.now().toString().slice(-8)}</p>
          </div>
          <Link href="/products" className="btn-primary px-8 py-3">{t('common.continueShopping')}</Link>
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
            { num: 1, label: t('checkout.shipping'), icon: Truck },
            { num: 2, label: t('checkout.payment'), icon: CreditCard },
            { num: 3, label: t('checkout.review'), icon: Package },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.num ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {s.num < 3 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-orange-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('checkout.shipping')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Prénom</label>
                    <input value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)} className="input" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nom</label>
                    <input value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)} className="input" placeholder="Dupont" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <input value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="input" type="email" placeholder="jean@email.com" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone</label>
                    <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="input" placeholder="+33 6 12 34 56 78" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse</label>
                    <input value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="input" placeholder="123 rue de la Paix" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ville</label>
                    <input value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="input" placeholder="Paris" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Code postal</label>
                    <input value={form.zip} onChange={(e) => updateForm('zip', e.target.value)} className="input" placeholder="75001" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pays</label>
                    <select value={form.country} onChange={(e) => updateForm('country', e.target.value)} className="input">
                      <option value="FR">🇫🇷 France</option>
                      <option value="HT">🇭🇹 Haïti</option>
                      <option value="GP">🇬🇵 Guadeloupe</option>
                      <option value="MQ">🇲🇶 Martinique</option>
                      <option value="GF">🇬🇫 Guyane</option>
                      <option value="RE">🇷🇪 Réunion</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="US">🇺🇸 États-Unis</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setStep(2)} className="btn-primary w-full py-3.5 mt-6">
                  Continuer vers le paiement
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('checkout.payment')}</h2>
                <div className="space-y-4">
                  <div className="border-2 border-orange-500 rounded-xl p-4 flex items-center gap-3 bg-orange-50">
                    <CreditCard className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-900">Carte bancaire</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Numéro de carte</label>
                      <input className="input" placeholder="4242 4242 4242 4242" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Expiration</label>
                        <input className="input" placeholder="MM/AA" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">CVC</label>
                        <input className="input" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3.5">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3.5">
                    Vérifier la commande
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('checkout.review')}</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Livraison à</p>
                    <p className="text-gray-900">{form.firstName} {form.lastName}</p>
                    <p className="text-gray-600 text-sm">{form.address}, {form.zip} {form.city}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-sm">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3.5">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                  </button>
                  <button onClick={handlePlaceOrder} className="btn-primary flex-1 py-3.5">
                    <Lock className="w-4 h-4 mr-2" /> {t('checkout.placeOrder')}
                  </button>
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

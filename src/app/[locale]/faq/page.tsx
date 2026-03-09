'use client';
import { useState } from 'react';
import { ChevronDown, HelpCircle, Truck, CreditCard, RotateCcw, Shield, Package, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';

const faqs = [
  { category: 'Commandes', icon: Package, questions: [
    { q: 'Comment passer une commande ?', a: 'Parcourez nos produits, ajoutez vos articles au panier, puis cliquez sur "Passer commande". Remplissez vos informations de livraison et procédez au paiement sécurisé via myPOS.' },
    { q: 'Puis-je modifier ma commande ?', a: 'Contactez-nous dans les 2 heures suivant votre commande via WhatsApp ou email.' },
    { q: 'Comment suivre ma commande ?', a: 'Connectez-vous et consultez "Mes commandes". Un email avec votre numéro de suivi vous sera envoyé.' },
  ]},
  { category: 'Livraison', icon: Truck, questions: [
    { q: 'Quels sont les délais ?', a: '3-7 jours pour Print on Demand, 7-15 jours pour dropshipping. Livraison GRATUITE dès 50 EUR.' },
    { q: 'Livrez-vous à l\'international ?', a: 'Oui ! Monde entier. France et DOM-TOM en tarifs préférentiels.' },
  ]},
  { category: 'Paiement', icon: CreditCard, questions: [
    { q: 'Quels moyens de paiement ?', a: 'Visa, Mastercard et autres CB via myPOS. Transactions protégées par chiffrement SSL.' },
    { q: 'Le paiement est-il sécurisé ?', a: 'Oui. myPOS est certifié PCI DSS. Vos données bancaires ne sont jamais stockées chez nous.' },
  ]},
  { category: 'Retours', icon: RotateCcw, questions: [
    { q: 'Quelle est votre politique de retour ?', a: '14 jours après réception pour retourner un article non utilisé dans son emballage.' },
    { q: 'Combien de temps pour un remboursement ?', a: '5-10 jours ouvrés sur votre moyen de paiement original.' },
  ]},
  { category: 'Compte & Sécurité', icon: Shield, questions: [
    { q: 'Mes données sont-elles protégées ?', a: 'Oui, conformément au RGPD. Données chiffrées, jamais partagées à des fins commerciales.' },
  ]},
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-[15px] font-medium text-gray-900 group-hover:text-orange-600 transition-colors pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-orange-500' : ''}`} />
      </button>
      {open && <p className="text-sm text-gray-600 leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16">
        <div className="container-shop text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" /> Centre d&apos;aide
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Questions fréquentes</h1>
          <p className="text-gray-600 max-w-lg mx-auto">Trouvez rapidement les réponses à vos questions.</p>
        </div>
      </section>
      <section className="container-shop py-12 -mt-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {faqs.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <Icon className="w-5 h-5 text-orange-500" /><h2 className="font-semibold text-gray-900">{s.category}</h2>
                </div>
                <div className="px-6">{s.questions.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}</div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-12 bg-white rounded-2xl p-8 max-w-xl mx-auto shadow-sm border border-gray-100">
          <Clock className="w-10 h-10 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Pas trouvé votre réponse ?</h3>
          <p className="text-sm text-gray-600 mb-5">Notre équipe est disponible du lundi au vendredi, 9h-18h.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" className="btn-primary text-sm">Nous contacter</Link>
            <a href="mailto:contact@maloune.fr" className="btn-outline text-sm">contact@maloune.fr</a>
          </div>
        </div>
      </section>
    </main>
  );
}


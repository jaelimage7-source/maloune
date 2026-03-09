export const metadata = {
  title: 'Politique de Confidentialité — Maloune',
  description: 'Politique de confidentialité et protection des données personnelles',
};

export default function PolitiqueConfidentialite() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>

        <div className="space-y-6">
          {[
            {
              title: "1. Responsable du traitement",
              content: "Pierre-Louis LAGUERRE, entrepreneur individuel, 19 Avenue du Docteur Fleming, 92600 Asnières-sur-Seine. Contact : contact@maloune.fr."
            },
            {
              title: "2. Données collectées",
              content: "Nous collectons les données suivantes lors de votre utilisation du site : nom, prénom, adresse email, adresse postale, numéro de téléphone (lors d'une commande) ; adresse IP et données de navigation (cookies techniques) ; historique de commandes. Ces données sont nécessaires à l'exécution de votre commande et à la gestion de votre compte client."
            },
            {
              title: "3. Finalités du traitement",
              content: "Vos données sont utilisées pour : le traitement et le suivi de vos commandes, l'envoi de confirmations et notifications par email, la gestion de votre compte client, le respect de nos obligations légales et comptables, et l'amélioration de nos services."
            },
            {
              title: "4. Base légale",
              content: "Le traitement de vos données repose sur : l'exécution du contrat (traitement de votre commande), le respect de nos obligations légales (conservation des factures), et votre consentement (newsletter, le cas échéant)."
            },
            {
              title: "5. Destinataires des données",
              content: "Vos données peuvent être transmises à : nos prestataires de paiement (myPOS) pour le traitement des transactions, nos partenaires logistiques pour la livraison de vos commandes, et notre hébergeur (Vercel Inc.) pour le fonctionnement du site. Aucune donnée n'est vendue ou cédée à des tiers à des fins commerciales."
            },
            {
              title: "6. Durée de conservation",
              content: "Vos données de compte sont conservées tant que votre compte est actif, puis supprimées 3 ans après votre dernière activité. Les données de commande sont conservées 10 ans conformément aux obligations comptables. Les données de navigation (cookies) sont conservées 13 mois maximum."
            },
            {
              title: "7. Vos droits",
              content: "Conformément au RGPD, vous disposez des droits suivants : droit d'accès à vos données, droit de rectification, droit à l'effacement, droit à la limitation du traitement, droit à la portabilité, droit d'opposition. Pour exercer ces droits, contactez-nous à contact@maloune.fr. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr)."
            },
            {
              title: "8. Sécurité",
              content: "Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des transactions (HTTPS/TLS), mots de passe hashés (bcrypt), cookies sécurisés HTTP-only, et accès restreint aux données personnelles."
            },
            {
              title: "9. Cookies",
              content: "Le site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement : cookie de session (authentification), cookie de panier (conservation du panier), cookie de langue (préférence linguistique). Aucun cookie publicitaire, de tracking ou de profilage n'est utilisé. Ces cookies techniques ne nécessitent pas votre consentement préalable conformément à la directive ePrivacy."
            },
            {
              title: "10. Transfert de données",
              content: "Certaines données peuvent être transférées vers les États-Unis (Vercel, hébergeur du site). Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne et le Data Privacy Framework."
            },
          ].map((section, i) => (
            <section key={i} className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
            </section>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">Dernière mise à jour : Mars 2026</p>
      </div>
    </main>
  );
}

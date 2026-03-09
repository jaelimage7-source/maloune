export const metadata = {
  title: 'Politique de Remboursement — Maloune',
  description: 'Politique de remboursement et retours du site maloune.fr',
};

export default function PolitiqueRemboursement() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Remboursement</h1>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Droit de rétractation — 14 jours</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Conformément au Code de la consommation (articles L.221-18 et suivants), vous disposez
              d&apos;un délai de <strong>14 jours calendaires</strong> à compter de la réception de votre
              commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Comment retourner un produit ?</h2>
            <div className="text-gray-700 text-sm leading-relaxed space-y-2">
              <p><strong>1.</strong> Envoyez un email à <a href="mailto:contact@maloune.fr" className="text-orange-500 hover:underline">contact@maloune.fr</a> en indiquant votre numéro de commande et le motif du retour.</p>
              <p><strong>2.</strong> Nous vous confirmerons la procédure de retour sous 48 heures.</p>
              <p><strong>3.</strong> Retournez le produit dans son emballage d&apos;origine, en parfait état.</p>
              <p><strong>4.</strong> Le remboursement sera effectué sous 14 jours après réception du retour.</p>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Frais de retour</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Les frais de retour sont à la charge du client, sauf en cas de produit défectueux
              ou non conforme à la description. Dans ce cas, les frais de retour seront remboursés.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Produit défectueux ou non conforme</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Si vous recevez un produit défectueux ou non conforme à votre commande, contactez-nous
              immédiatement à contact@maloune.fr avec des photos du produit. Nous organiserons le retour
              et le remplacement ou le remboursement intégral (produit + frais de livraison + frais de retour).
            </p>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Modalités de remboursement</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Le remboursement est effectué par le même moyen de paiement que celui utilisé lors de la
              commande initiale, dans un délai de 14 jours suivant la réception du produit retourné.
              Le montant remboursé comprend le prix du produit et les frais de livraison initiaux
              (pour le mode de livraison standard le moins coûteux).
            </p>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Exclusions</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Le droit de rétractation ne s&apos;applique pas aux produits personnalisés, aux produits
              descellés après livraison ne pouvant être renvoyés pour des raisons d&apos;hygiène ou de
              protection de la santé, et aux produits qui ont été mélangés de manière indissociable
              avec d&apos;autres articles après livraison.
            </p>
          </section>

          <section className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h2 className="text-lg font-semibold text-orange-900 mb-3">Besoin d&apos;aide ?</h2>
            <p className="text-orange-800 text-sm">
              Pour toute question concernant un retour ou un remboursement, n&apos;hésitez pas à nous contacter
              à <a href="mailto:contact@maloune.fr" className="font-semibold hover:underline">contact@maloune.fr</a>.
              Nous nous engageons à vous répondre sous 48 heures.
            </p>
          </section>
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">Dernière mise à jour : Mars 2026</p>
      </div>
    </main>
  );
}

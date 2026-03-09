export const metadata = {
  title: 'Conditions Générales de Vente — Maloune',
  description: 'Conditions générales de vente du site maloune.fr',
};

export default function CGV() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales de Vente</h1>

        <div className="space-y-6">
          {[
            {
              title: "Article 1 — Identification du vendeur",
              content: "Le site maloune.fr est exploité par Pierre-Louis LAGUERRE, entrepreneur individuel, immatriculé au RCS de Nanterre sous le numéro SIREN 528 266 729, dont le siège social est situé au 19 Avenue du Docteur Fleming, 92600 Asnières-sur-Seine. Contact : contact@maloune.fr."
            },
            {
              title: "Article 2 — Objet",
              content: "Les présentes CGV régissent les ventes de produits effectuées sur maloune.fr. Toute commande implique l'acceptation sans réserve des présentes CGV."
            },
            {
              title: "Article 3 — Produits et prix",
              content: "Les produits proposés sont décrits sur le site avec la plus grande exactitude possible. Les prix sont indiqués en euros (€) TTC. TVA non applicable — article 293 B du CGI. Les frais de livraison sont indiqués avant validation de la commande. Le vendeur se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés au prix en vigueur lors de l'enregistrement de la commande."
            },
            {
              title: "Article 4 — Commande et paiement",
              content: "Le client passe commande en suivant le processus d'achat en ligne. La validation de la commande implique l'acceptation des présentes CGV. Le paiement s'effectue par carte bancaire via la plateforme sécurisée myPOS. Le paiement est débité au moment de la commande. Les transactions sont sécurisées et chiffrées."
            },
            {
              title: "Article 5 — Livraison",
              content: "Les produits sont livrés à l'adresse indiquée lors de la commande. Les délais indicatifs sont : France métropolitaine 10 à 20 jours ouvrés, DOM-TOM 15 à 30 jours ouvrés, Europe 12 à 25 jours ouvrés, International 15 à 40 jours ouvrés. Un numéro de suivi est communiqué par email dès l'expédition. En cas de retard significatif, le client peut contacter contact@maloune.fr."
            },
            {
              title: "Article 6 — Droit de rétractation",
              content: "Conformément aux articles L.221-18 et suivants du Code de la consommation, le client dispose d'un délai de 14 jours calendaires à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités. Pour exercer ce droit, envoyez un email à contact@maloune.fr en indiquant votre numéro de commande. Les frais de retour sont à la charge du client. Le remboursement sera effectué dans un délai de 14 jours suivant la réception des produits retournés, par le même moyen de paiement que celui utilisé lors de la commande."
            },
            {
              title: "Article 7 — Garanties",
              content: "Tous les produits bénéficient de la garantie légale de conformité (articles L.217-4 à L.217-14 du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 à 1649 du Code civil). En cas de produit défectueux ou non conforme, le client peut demander le remplacement ou le remboursement en contactant contact@maloune.fr."
            },
            {
              title: "Article 8 — Responsabilité",
              content: "Le vendeur ne saurait être tenu responsable de l'inexécution du contrat en cas de force majeure, de rupture de stock, ou de perturbation totale ou partielle des moyens de communication. Les photographies des produits sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit reçu."
            },
            {
              title: "Article 9 — Données personnelles",
              content: "Les données personnelles collectées lors de la commande sont nécessaires au traitement de celle-ci. Elles sont traitées conformément au RGPD. Le client dispose d'un droit d'accès, de rectification et de suppression de ses données. Pour plus d'informations, consultez notre Politique de Confidentialité."
            },
            {
              title: "Article 10 — Loi applicable",
              content: "Les présentes CGV sont soumises au droit français. Tout litige relatif à leur interprétation ou leur exécution relève des tribunaux compétents du ressort de la Cour d'appel de Versailles."
            },
          ].map((article, i) => (
            <section key={i} className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{article.title}</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{article.content}</p>
            </section>
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 text-center">Dernière mise à jour : Mars 2026</p>
      </div>
    </main>
  );
}

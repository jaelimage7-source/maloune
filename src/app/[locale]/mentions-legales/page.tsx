export const metadata = {
  title: 'Mentions Légales — Maloune',
  description: 'Mentions légales du site maloune.fr',
};

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
          <div className="space-y-1 text-gray-700 text-sm">
            <p>Le site <strong>maloune.fr</strong> est édité par :</p>
            <p><strong>Nom :</strong> Pierre-Louis LAGUERRE</p>
            <p><strong>Statut :</strong> Entrepreneur individuel</p>
            <p><strong>SIREN :</strong> 528 266 729</p>
            <p><strong>RCS :</strong> Nanterre</p>
            <p><strong>Siège social :</strong> 19 Avenue du Docteur Fleming, 92600 Asnières-sur-Seine, France</p>
            <p><strong>Email :</strong> <a href="mailto:contact@maloune.fr" className="text-orange-500 hover:underline">contact@maloune.fr</a></p>
            <p><strong>Directeur de la publication :</strong> Pierre-Louis LAGUERRE</p>
            <p><strong>TVA :</strong> Non applicable — article 293 B du CGI (franchise en base de TVA)</p>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Hébergeur</h2>
          <div className="space-y-1 text-gray-700 text-sm">
            <p><strong>Raison sociale :</strong> Vercel Inc.</p>
            <p><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
            <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
          <p className="text-gray-700 text-sm">
            L&apos;ensemble du contenu du site maloune.fr (textes, images, graphismes, logo, icônes, etc.)
            est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie
            des éléments du site est interdite sans l&apos;autorisation écrite préalable de l&apos;éditeur.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Données personnelles</h2>
          <p className="text-gray-700 text-sm">
            Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d&apos;un droit
            d&apos;accès, de rectification, de suppression et de portabilité de vos données personnelles.
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@maloune.fr" className="text-orange-500 hover:underline">contact@maloune.fr</a>.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">5. Cookies</h2>
          <p className="text-gray-700 text-sm">
            Le site utilise uniquement des cookies techniques nécessaires à son fonctionnement
            (session, panier, préférences de langue). Aucun cookie publicitaire ou de suivi n&apos;est utilisé.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">6. Médiation des litiges</h2>
          <p className="text-gray-700 text-sm">
            Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige
            non résolu, le consommateur peut recourir gratuitement à un médiateur de la consommation.
            Nous vous communiquerons les coordonnées du médiateur compétent sur simple demande à
            contact@maloune.fr.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">7. Loi applicable</h2>
          <p className="text-gray-700 text-sm">
            Le présent site et ses mentions légales sont soumis au droit français.
            En cas de litige, les tribunaux compétents du ressort de la Cour d&apos;appel de Versailles
            seront seuls compétents.
          </p>
        </section>

        <p className="text-xs text-gray-400 mt-8 text-center">Dernière mise à jour : Mars 2026</p>
      </div>
    </main>
  );
}

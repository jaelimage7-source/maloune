import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-orange-500/20 mb-2">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page introuvable</h1>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">La page que vous cherchez n&apos;existe pas ou a été déplacée.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary text-sm px-6">Retour à l&apos;accueil</Link>
          <Link href="/products" className="btn-outline text-sm px-6">Voir les produits</Link>
        </div>
      </div>
    </main>
  );
}


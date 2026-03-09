'use client';
import { Link } from '@/i18n/routing';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb { label: string; href?: string; }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="container-shop py-3">
      <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" className="hover:text-orange-500 transition-colors flex items-center gap-1" itemProp="item">
            <Home className="w-3.5 h-3.5" /><span itemProp="name">Accueil</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <ChevronRight className="w-3 h-3 text-gray-300" />
            {item.href ? (
              <Link href={item.href} className="hover:text-orange-500 transition-colors" itemProp="item"><span itemProp="name">{item.label}</span></Link>
            ) : (
              <span className="text-gray-900 font-medium" itemProp="name">{item.label}</span>
            )}
            <meta itemProp="position" content={String(i + 2)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}


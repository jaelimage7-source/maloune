'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';

export default function CartBlocker() {
  const pathname = usePathname();
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    // Block checkout access
    if (pathname?.includes('/checkout') && items.length > 0) {
      alert('Notre boutique ouvre très bientôt ! Les achats ne sont pas encore disponibles.');
      router.back();
    }
  }, [pathname, items, router]);

  return null;
}

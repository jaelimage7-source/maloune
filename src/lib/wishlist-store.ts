import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  addedAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          if (state.items.some(i => i.id === item.id)) return state;
          return { items: [...state.items, { ...item, addedAt: Date.now() }] };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      isInWishlist: (id) => get().items.some(i => i.id === id),
      clearWishlist: () => set({ items: [] }),
      totalItems: () => get().items.length,
    }),
    { name: 'maloune-wishlist' }
  )
);


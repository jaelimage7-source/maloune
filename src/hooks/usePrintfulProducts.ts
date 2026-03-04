'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePrintfulProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/printful/products');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch');
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, loading, error, refresh: fetchProducts };
}

export function usePrintfulProduct(productId: number | null) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const fetch_ = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/printful/products?id=${productId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setProduct(data.product);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [productId]);

  return { product, loading, error };
}

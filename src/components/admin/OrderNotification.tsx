'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellRing, Volume2, VolumeX } from 'lucide-react';

export default function OrderNotification() {
  const [newCount, setNewCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdm+Jk5WHd2x0goqSjoBybnd/h42SjoBsZnB6houQjoJ0bHF7homOjoF0bXF7hoqQjIF0bHF8h4yRjIB0bXJ8h42Sj4F0bXF8h4yQjH5zbnR/i5CRjYF0b3N+ipCRjYB0b3N+ipGSjYB1cHR/jJKTjYF1cHR+ipCRjYBzbnR/ipGSjX90b3V/i5KUjoF0cHV+ipGSjX90bXR/ipGSjn50bXN/ipGSjn90bnV/i5KUjoF0cHZ/i5KUkIJ2cnh/jJOUj4N3cXd/i5KUjoF1cHV/i5OUkIN3cnh/jJOUkIJ2cnd/i5KUjoF0b3V/ipKTjoF0b3V/ipGSjn5zbnR/ipGSjn50bnV/i5KUjoF1cHV/i5OUkIJ2cnh/jJSVkYN4c3l/jJSVkIJ2cXd/');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  const checkNewOrders = useCallback(async () => {
    try {
      const url = lastCheck
        ? `/api/admin/orders/list?since=${lastCheck}`
        : '/api/admin/orders/list';
      const r = await fetch(url, { headers: { 'x-admin-key': '' } });
      if (!r.ok) return;
      const j = await r.json();
      if (j.success && lastCheck) {
        const newOrders = j.orders?.filter((o: any) => new Date(o.createdAt) > new Date(lastCheck));
        if (newOrders && newOrders.length > 0) {
          setNewCount(prev => prev + newOrders.length);
          playNotification();
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 5000);
        }
      }
      setLastCheck(new Date().toISOString());
    } catch {}
  }, [lastCheck, playNotification]);

  useEffect(() => {
    setLastCheck(new Date().toISOString());
    intervalRef.current = setInterval(checkNewOrders, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [checkNewOrders]);

  return (
    <div className="relative flex items-center gap-2">
      <button onClick={() => setSoundEnabled(!soundEnabled)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title={soundEnabled ? 'Son activé' : 'Son désactivé'}>
        {soundEnabled ? <Volume2 className="w-4 h-4 text-green-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
      </button>
      <button onClick={() => { setNewCount(0); setShowPopup(false); }} className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        {newCount > 0 ? <BellRing className="w-5 h-5 text-orange-500 animate-bounce" /> : <Bell className="w-5 h-5 text-gray-400" />}
        {newCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>
      {showPopup && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 w-64 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <BellRing className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Nouvelle commande!</p>
              <p className="text-xs text-gray-500">Vérifiez le tableau de bord</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


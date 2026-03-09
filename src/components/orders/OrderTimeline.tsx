'use client';
import { Check, Clock, CreditCard, Package, Truck, Home, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'En attente', icon: Clock, color: 'yellow' },
  { key: 'PAID', label: 'Payée', icon: CreditCard, color: 'blue' },
  { key: 'PROCESSING', label: 'Préparation', icon: Package, color: 'purple' },
  { key: 'SHIPPED', label: 'Expédiée', icon: Truck, color: 'indigo' },
  { key: 'DELIVERED', label: 'Livrée', icon: Home, color: 'green' },
];

const COLORS: Record<string, string> = {
  yellow: 'bg-yellow-500', blue: 'bg-blue-500', purple: 'bg-purple-500',
  indigo: 'bg-indigo-500', green: 'bg-green-500', red: 'bg-red-500',
};

export default function OrderTimeline({ status }: { status: string }) {
  if (status === 'CANCELLED' || status === 'REFUNDED') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700">{status === 'CANCELLED' ? 'Commande annulée' : 'Commande remboursée'}</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isActive ? `${COLORS[step.color]} text-white` : 'bg-gray-100 text-gray-400'
              } ${isCurrent ? 'ring-2 ring-offset-2 ring-orange-300 scale-110' : ''}`}>
                {isActive && i < currentIndex ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 rounded ${i < currentIndex ? COLORS[step.color] : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}


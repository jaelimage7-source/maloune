"use client";
// @ts-ignore
import OrderTimeline from "@/components/orders/OrderTimeline";

import { useState, useEffect, useCallback } from "react";
import { User, Package, LogIn, LogOut, Eye, EyeOff, Loader2, ChevronRight, Clock, CheckCircle, Truck, XCircle, MapPin, UserPlus } from "lucide-react";

interface CustomerData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  tracking?: { trackingNumber: string; carrierName: string | null; trackingUrl: string | null; currentStatus: string | null }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", color: "text-yellow-600 bg-yellow-50", icon: Clock },
  PAID: { label: "Payée", color: "text-blue-600 bg-blue-50", icon: CheckCircle },
  PROCESSING: { label: "En préparation", color: "text-purple-600 bg-purple-50", icon: Package },
  SHIPPED: { label: "Expédiée", color: "text-indigo-600 bg-indigo-50", icon: Truck },
  DELIVERED: { label: "Livrée", color: "text-green-600 bg-green-50", icon: CheckCircle },
  CANCELLED: { label: "Annulée", color: "text-red-600 bg-red-50", icon: XCircle },
  REFUNDED: { label: "Remboursée", color: "text-gray-600 bg-gray-50", icon: XCircle },
};

export default function AccountPage() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"login" | "register" | "dashboard" | "orders" | "profile" | "order-detail">("login");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch { /* ignore */ }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.customer) {
          setCustomer(data.customer);
          setView("dashboard");
          await fetchOrders();
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchOrders]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleLogin = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setView("dashboard");
        await fetchOrders();
      } else {
        setFormError(data.error || "Erreur de connexion");
      }
    } catch {
      setFormError("Erreur réseau");
    }
    setFormLoading(false);
  };

  const handleRegister = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setView("dashboard");
        await fetchOrders();
      } else {
        setFormError(data.error || "Erreur d'inscription");
      }
    } catch {
      setFormError("Erreur réseau");
    }
    setFormLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
    setOrders([]);
    setView("login");
    setEmail("");
    setPassword("");
  };

  const handleUpdateProfile = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setView("dashboard");
      } else {
        setFormError(data.error || "Erreur");
      }
    } catch {
      setFormError("Erreur réseau");
    }
    setFormLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* LOGIN */}
        {view === "login" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <User className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Connexion</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Connectez-vous pour suivre vos commandes</p>

              {formError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{formError}</div>}

              <div className="space-y-3">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password}
                    onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none pr-12" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button onClick={handleLogin} disabled={formLoading}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Se connecter</>}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Pas encore de compte ?{" "}
                  <button onClick={() => { setView("register"); setFormError(""); }} className="text-orange-500 font-semibold hover:underline">
                    Créer un compte
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER */}
        {view === "register" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <UserPlus className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Créer un compte</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Inscrivez-vous pour gérer vos commandes</p>

              {formError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{formError}</div>}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                  <input type="text" placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                <input type="tel" placeholder="Téléphone (optionnel)" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Mot de passe (8 car. min)" value={password}
                    onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none pr-12" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button onClick={handleRegister} disabled={formLoading}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Créer mon compte</>}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Déjà un compte ?{" "}
                  <button onClick={() => { setView("login"); setFormError(""); }} className="text-orange-500 font-semibold hover:underline">
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && customer && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour{customer.firstName ? `, ${customer.firstName}` : ""} !
                </h1>
                <p className="text-gray-500 text-sm">{customer.email}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition p-2" title="Déconnexion">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setView("orders")}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition text-left">
                <Package className="w-7 h-7 text-orange-500 mb-2" />
                <h3 className="font-semibold text-gray-900">Mes commandes</h3>
                <p className="text-sm text-gray-500 mt-1">{orders.length} commande{orders.length !== 1 ? "s" : ""}</p>
              </button>
              <button onClick={() => { setFirstName(customer.firstName || ""); setLastName(customer.lastName || ""); setPhone(customer.phone || ""); setView("profile"); }}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition text-left">
                <User className="w-7 h-7 text-orange-500 mb-2" />
                <h3 className="font-semibold text-gray-900">Mon profil</h3>
                <p className="text-sm text-gray-500 mt-1">Modifier mes infos</p>
              </button>
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Commandes récentes</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => {
                    const status = statusConfig[order.status] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <button key={order.id} onClick={() => { setSelectedOrder(order); setView("order-detail"); }}
                        className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition flex items-center gap-4 text-left">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900 text-sm">{order.orderNumber}</span>
                            <span className="font-bold text-gray-900">{Number(order.totalAmount).toFixed(2)} EUR</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </button>
                    );
                  })}
                </div>
                {orders.length > 5 && (
                  <button onClick={() => setView("orders")} className="w-full text-center text-orange-500 font-medium text-sm mt-3 hover:underline">
                    Voir toutes les commandes ({orders.length})
                  </button>
                )}
              </div>
            )}

            {orders.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Aucune commande</h3>
                <p className="text-sm text-gray-500">Vos commandes apparaîtront ici</p>
              </div>
            )}
          </div>
        )}

        {/* ORDERS LIST */}
        {view === "orders" && customer && (
          <div>
            <button onClick={() => setView("dashboard")} className="text-orange-500 font-medium text-sm mb-4 hover:underline flex items-center gap-1">
              ← Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>
            <div className="space-y-3">
              {orders.map(order => {
                const status = statusConfig[order.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                return (
                  <button key={order.id} onClick={() => { setSelectedOrder(order); setView("order-detail"); }}
                    className="w-full bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition text-left">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                          <span className="font-bold text-gray-900">{Number(order.totalAmount).toFixed(2)} EUR</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                          <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {order.items.length} article{order.items.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
              {orders.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucune commande</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDER DETAIL */}
        {view === "order-detail" && selectedOrder && (
          <div>
            <button onClick={() => setView("orders")} className="text-orange-500 font-medium text-sm mb-4 hover:underline flex items-center gap-1">
              ← Retour aux commandes
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{selectedOrder.orderNumber}</h1>
                  <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
                {(() => {
                  const status = statusConfig[selectedOrder.status] || statusConfig.PENDING;
                  return <span className={`text-sm font-medium px-3 py-1 rounded-full ${status.color}`}>{status.label}</span>;
                })()}
              </div>

              {/* Items */}
              <h3 className="font-semibold text-gray-900 mb-3">Articles</h3>
              <div className="space-y-2 mb-6">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <span className="text-gray-900 text-sm">{item.productName}</span>
                      <span className="text-gray-400 text-xs ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{Number(item.totalPrice).toFixed(2)} EUR</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">{Number(selectedOrder.totalAmount).toFixed(2)} EUR</span>
              </div>

              {/* Tracking */}
              {selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-900">Suivi de livraison</h3>
                  </div>
                  {selectedOrder.tracking.map((t, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-indigo-800">
                        {t.carrierName && <span className="font-medium">{t.carrierName}: </span>}
                        {t.trackingNumber}
                      </p>
                      {t.currentStatus && <p className="text-indigo-600 text-xs mt-1">{t.currentStatus}</p>}
                      {t.trackingUrl && (
                        <a href={t.trackingUrl} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-500 hover:underline text-xs mt-1 inline-block">
                          Suivre le colis →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {view === "profile" && customer && (
          <div className="max-w-md mx-auto">
            <button onClick={() => setView("dashboard")} className="text-orange-500 font-medium text-sm mb-4 hover:underline">
              ← Retour
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

              {formError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{formError}</div>}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input type="email" value={customer.email} disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Prénom</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nom</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                </div>
                <button onClick={handleUpdateProfile} disabled={formLoading}
                  className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

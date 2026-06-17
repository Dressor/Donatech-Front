import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'donatech_cart';

// Identidad de una línea del carrito: (campaña, kit). Un mismo kit en dos campañas son dos líneas.
const sameLine = (i, campaignId, kitId) => i.kitId === kitId && i.campaignId === campaignId;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const persisted = loadCart();
  const [items, setItems] = useState(persisted?.items ?? []);
  const [coupon, setCoupon] = useState(persisted?.coupon ?? '');

  // Persistir el carrito ante cualquier cambio: sobrevive recargas y navegación.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, coupon }));
    } catch {
      /* storage lleno o no disponible: ignorar */
    }
  }, [items, coupon]);

  // Cada item lleva su campaña (id, nombre, logística por kit). Sin campaña global de carrito:
  // así un carrito puede mezclar campañas y el checkout las separa en una orden por campaña.
  const addItem = useCallback((kit, cantidad = 1, campaign = {}) => {
    const campaignId = campaign.campaignId ?? null;
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, campaignId, kit.id));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, campaignId, kit.id) ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [
        ...prev,
        {
          kitId: kit.id,
          kit,
          cantidad,
          campaignId,
          campaignNombre: campaign.campaignNombre ?? null,
          campaignLogistica: campaign.campaignLogistica ?? 0,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((campaignId, kitId) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, campaignId, kitId)));
  }, []);

  const updateQuantity = useCallback((campaignId, kitId, cantidad) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => !sameLine(i, campaignId, kitId)));
    } else {
      setItems((prev) =>
        prev.map((i) => (sameLine(i, campaignId, kitId) ? { ...i, cantidad } : i))
      );
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCoupon('');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // Vaciar el carrito al cerrar sesión o cambiar de usuario (evita arrastrarlo entre donantes).
  const prevEmail = useRef(user?.email ?? null);
  useEffect(() => {
    const email = user?.email ?? null;
    if (prevEmail.current !== null && email !== prevEmail.current) {
      clear();
    }
    prevEmail.current = email;
  }, [user?.email, clear]);

  const priceOf = (i) => i.kit?.precioEstimado ?? i.kit?.precioBase ?? 0;
  const subtotal = items.reduce((sum, i) => sum + priceOf(i) * i.cantidad, 0);
  const unidades = items.reduce((sum, i) => sum + i.cantidad, 0);
  const logisticaTotal = items.reduce((sum, i) => sum + (i.campaignLogistica ?? 0) * i.cantidad, 0);
  const total = subtotal + logisticaTotal;

  // Agrupar por campaña: cada grupo es una futura orden con su logística/beneficiario.
  const groups = Object.values(
    items.reduce((acc, i) => {
      const key = i.campaignId ?? 'null';
      if (!acc[key]) {
        acc[key] = {
          campaignId: i.campaignId ?? null,
          campaignNombre: i.campaignNombre ?? null,
          campaignLogistica: i.campaignLogistica ?? 0,
          items: [],
          unidades: 0,
          subtotal: 0,
          logisticaTotal: 0,
          total: 0,
        };
      }
      const g = acc[key];
      g.items.push(i);
      g.unidades += i.cantidad;
      g.subtotal += priceOf(i) * i.cantidad;
      g.logisticaTotal += (i.campaignLogistica ?? 0) * i.cantidad;
      g.total = g.subtotal + g.logisticaTotal;
      return acc;
    }, {})
  );

  return (
    <CartContext.Provider
      value={{
        items, groups,
        coupon, setCoupon, addItem, removeItem, updateQuantity, clear,
        subtotal, unidades, logisticaTotal, total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'donatech_cart';

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
  const [campaignId, setCampaignId] = useState(persisted?.campaignId ?? null);
  const [campaignLogistica, setCampaignLogistica] = useState(persisted?.campaignLogistica ?? 0);
  const [coupon, setCoupon] = useState(persisted?.coupon ?? '');

  // Persistir el carrito ante cualquier cambio: sobrevive recargas y navegación.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, campaignId, campaignLogistica, coupon }));
    } catch {
      /* storage lleno o no disponible: ignorar */
    }
  }, [items, campaignId, campaignLogistica, coupon]);

  const addItem = useCallback((kit, cantidad = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.kitId === kit.id);
      if (existing) {
        return prev.map((i) =>
          i.kitId === kit.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [...prev, { kitId: kit.id, kit, cantidad }];
    });
  }, []);

  const removeItem = useCallback((kitId) => {
    setItems((prev) => prev.filter((i) => i.kitId !== kitId));
  }, []);

  const updateQuantity = useCallback((kitId, cantidad) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.kitId !== kitId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.kitId === kitId ? { ...i, cantidad } : i))
      );
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCampaignId(null);
    setCampaignLogistica(0);
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

  const subtotal = items.reduce(
    (sum, i) => sum + (i.kit?.precioEstimado ?? i.kit?.precioBase ?? 0) * i.cantidad,
    0
  );
  const unidades = items.reduce((sum, i) => sum + i.cantidad, 0);
  const logisticaTotal = (campaignLogistica ?? 0) * unidades;
  const total = subtotal + logisticaTotal;

  return (
    <CartContext.Provider
      value={{
        items, campaignId, setCampaignId, campaignLogistica, setCampaignLogistica,
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

import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [campaignId, setCampaignId] = useState(null);
  const [coupon, setCoupon] = useState('');

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
    setCoupon('');
  }, []);

  const total = items.reduce(
    (sum, i) => sum + (i.kit?.precioEstimado ?? i.kit?.precioBase ?? 0) * i.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, campaignId, setCampaignId, coupon, setCoupon, addItem, removeItem, updateQuantity, clear, total }}
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

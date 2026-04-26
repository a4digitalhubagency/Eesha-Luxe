import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "@/types";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    { name: "eesha-cart" }
  )
);

// Derived selectors — computed outside state to avoid Object.assign getter bug
export const selectItemCount = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectTotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

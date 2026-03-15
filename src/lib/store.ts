import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'EGP' | 'USD' | 'SAR' | 'EUR';

export const exchangeRates: Record<Currency, number> = {
  EGP: 1,      // Base currency
  USD: 0.021,  // Roughly 1 USD = 48 EGP
  SAR: 0.078,  // Roughly 1 SAR = 12.8 EGP
  EUR: 0.019,  // Roughly 1 EUR = 52 EGP
};

export const currencySymbols: Record<Currency, string> = {
  EGP: 'ج.م',
  USD: '$',
  SAR: 'ر.س',
  EUR: '€',
};

interface AppState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export interface CartItem {
  id: string; // product id + selected options hash
  productId: string;
  name_ar: string;
  name_en: string;
  price: number; // Stored in base EGP
  image: string;
  quantity: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currency: 'EGP',
      setCurrency: (currency) => set({ currency }),
      
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i) => 
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          };
        }
        return { cart: [...state.cart, item] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map((i) => i.id === id ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ cart: [] })
    }),
    {
      name: 'my-phone-store',
    }
  )
);

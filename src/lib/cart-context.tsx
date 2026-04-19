'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Product } from './data';
import { COURT_BOOKING_PRICE } from './data';

export interface CartProduct {
  type: 'product';
  id: string;
  product: Product;
  quantity: number;
}

export interface CartBooking {
  type: 'booking';
  id: string;
  courtId: string;
  courtName: string;
  date: string;
  time: string;
  timeLabel: string;
  price: number;
  slotId?: string;
}

export type CartItem = CartProduct | CartBooking;

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_PRODUCT'; product: Product }
  | {
      type: 'ADD_BOOKING';
      courtId: string;
      courtName: string;
      date: string;
      time: string;
      timeLabel: string;
      slotId?: string;
    }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QTY'; id: string; delta: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const existing = state.items.find(
        (i): i is CartProduct => i.type === 'product' && i.product.id === action.product.id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id ? { ...existing, quantity: existing.quantity + 1 } : i,
          ),
        };
      }
      const newItem: CartProduct = {
        type: 'product',
        id: `prod-${action.product.id}-${Date.now()}`,
        product: action.product,
        quantity: 1,
      };
      return { items: [...state.items, newItem] };
    }
    case 'ADD_BOOKING': {
      const bookingId = `booking-${action.courtId}-${action.date}-${action.time}`;
      if (state.items.find((i) => i.id === bookingId)) return state;
      const newBooking: CartBooking = {
        type: 'booking',
        id: bookingId,
        courtId: action.courtId,
        courtName: action.courtName,
        date: action.date,
        time: action.time,
        timeLabel: action.timeLabel,
        price: COURT_BOOKING_PRICE,
        slotId: action.slotId,
      };
      return { items: [...state.items, newBooking] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QTY': {
      return {
        items: state.items
          .map((i) => {
            if (i.type !== 'product' || i.id !== action.id) return i;
            const next = i.quantity + action.delta;
            if (next < 1) return null;
            return { ...i, quantity: next };
          })
          .filter((i): i is CartItem => i !== null),
      };
    }
    case 'CLEAR':
      return { items: [] };
    case 'HYDRATE':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addProduct: (product: Product) => void;
  addBooking: (
    courtId: string,
    courtName: string,
    date: string,
    time: string,
    timeLabel: string,
    slotId?: string,
  ) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rp-cart');
      if (stored) {
        dispatch({ type: 'HYDRATE', items: JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rp-cart', JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((sum, item) => {
    if (item.type === 'product') return sum + item.product.price * item.quantity;
    return sum + item.price;
  }, 0);

  const count = state.items.reduce((sum, item) => {
    if (item.type === 'product') return sum + item.quantity;
    return sum + 1;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addProduct: (p) => dispatch({ type: 'ADD_PRODUCT', product: p }),
        addBooking: (cId, cName, date, time, timeLabel, slotId) =>
          dispatch({
            type: 'ADD_BOOKING',
            courtId: cId,
            courtName: cName,
            date,
            time,
            timeLabel,
            slotId,
          }),
        removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
        updateQty: (id, delta) => dispatch({ type: 'UPDATE_QTY', id, delta }),
        clear: () => dispatch({ type: 'CLEAR' }),
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

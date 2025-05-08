import { createContext, useContext, useState, ReactNode } from "react";
import { useNotification } from "./NotificationContext";

type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (item: Omit<CartItem, "quantity">) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { pushNotification } = useNotification();

  const addToCart = async (item: Omit<CartItem, "quantity">) => {
    const existingItemQuantity = cartItems.find((i) => i.name === item.name)?.quantity;

    if (existingItemQuantity) {
      pushNotification(`Adicionado x${existingItemQuantity + 1} ${item.name} ao carrinho`);
    }
    else {
      pushNotification(`Adicionado x1 ${item.name} ao carrinho`);
    }

    let updatedQuantity = 1;
    let updatedCart: CartItem[] = [];

    setCartItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
  
      if (existing) {
        updatedQuantity = existing.quantity + 1;
        updatedCart = prev.map((i) =>
          i.name === item.name ? { ...i, quantity: updatedQuantity } : i
        );
      } else {
        updatedCart = [...prev, { ...item, quantity: 1 }];
      }
  
      return updatedCart;
    });
  };
  
  

  const removeFromCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      return prev
        .map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, restaurantId) => {
    setCartItems(prev => {
      // Prevent adding items from different restaurants
      if (prev.length > 0 && prev[0].restaurant_id !== restaurantId) {
        alert("You can only order from one restaurant at a time. Please clear your cart to add items from a new restaurant.");
        return prev;
      }

      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, restaurant_id: restaurantId }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQuantity = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQuantity };
      }
      return i;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    cartTotal,
    cartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

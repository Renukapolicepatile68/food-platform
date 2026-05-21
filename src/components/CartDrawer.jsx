import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <p className="text-gray-500 font-medium">Your cart is empty.</p>
              <button 
                onClick={toggleCart}
                className="text-orange-500 font-semibold hover:text-orange-600"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button 
                  onClick={clearCart}
                  className="text-sm text-red-500 font-medium hover:text-red-600"
                >
                  Clear Cart
                </button>
              </div>
              
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-500 text-sm font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-gray-500 hover:text-orange-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[1rem] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-gray-500 hover:text-orange-500"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-gray-400 hover:text-red-500 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-gray-900">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex justify-center items-center gap-2"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

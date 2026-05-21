import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    const orderData = {
      total_amount: cartTotal,
      items: cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('You must be logged in to place an order.');
      }

      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/login', { state: { successMessage: 'Session expired. Please log in again.' } });
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to place order. Please try again.');
      }

      const data = await response.json();
      clearCart();
      navigate(`/order-tracker/${data.order_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">Your delicious food is being prepared and will be delivered soon.</p>
          <Link 
            to="/customer-dashboard" 
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
        <Link to="/customer-dashboard" className="text-orange-500 font-semibold hover:text-orange-600">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 shadow-sm h-16 flex items-center px-4 sm:px-8 sticky top-0 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-8">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-gray-700">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">{item.quantity}x</span>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-3">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span>$2.99</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 mt-2 border-t border-gray-100">
              <span>Total</span>
              <span>${(cartTotal + 2.99).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-10 bg-gray-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition-all shadow-xl shadow-gray-900/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

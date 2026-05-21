import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Clock, Star, Plus, Loader2, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/restaurants';

const Menu = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        // Fetch restaurant details
        const resResponse = await fetch(`${API_URL}/${id}`);
        if (!resResponse.ok) throw new Error('Failed to fetch restaurant details');
        const resData = await resResponse.json();
        setRestaurant(resData);

        // Fetch menu items
        const menuResponse = await fetch(`${API_URL}/${id}/menu`);
        if (!menuResponse.ok) throw new Error('Failed to fetch menu items');
        const menuData = await menuResponse.json();
        setMenuItems(menuData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantAndMenu();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="font-medium">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Link to="/customer-dashboard" className="text-orange-500 font-semibold hover:text-orange-600">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header Image */}
      <div className="h-64 md:h-80 w-full relative">
        <img 
          src={restaurant?.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070'} 
          alt={restaurant?.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute top-6 left-6 md:left-12">
          <Link 
            to="/customer-dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 md:left-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{restaurant?.name}</h1>
          <div className="flex items-center gap-4 text-sm md:text-base font-medium">
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full">{restaurant?.cuisine}</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current"/> {restaurant?.rating}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {restaurant?.delivery_time}</span>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Menu</h2>
        
        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items available for this restaurant.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover rounded-2xl mb-4" />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                  <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-2">{item.description}</p>
                <button 
                  onClick={() => addToCart(item, parseInt(id))}
                  className="w-full bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;

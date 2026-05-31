import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, SlidersHorizontal, Search, AlertCircle, Loader2, ShoppingBag, User } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import { useCart } from '../context/CartContext';

const API_URL = 'http://localhost:8000/api/restaurants';

const CustomerDashboard = () => {
  const { cartCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const userName = localStorage.getItem('userName') || 'Customer';

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans page-wrapper">
      <nav className="bg-white border-b border-gray-100 shadow-sm h-16 flex items-center px-6 sm:px-8 justify-between sticky top-0 z-40">
        <div className="font-bold text-xl text-gray-900 tracking-tight">
          Quick<span className="text-orange-500">Bite</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded-xl gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-56 focus:ring-0 text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Greeting */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 font-medium">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden lg:inline">Hi, <span className="font-bold text-gray-900">{userName.split(' ')[0]}</span></span>
          </div>

          <button
            onClick={toggleCart}
            className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors rounded-xl hover:bg-orange-50"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-slow">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 font-medium transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Mobile search */}
        <div className="flex md:hidden items-center bg-white border border-gray-200 px-4 py-3 rounded-2xl gap-2 mb-6 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full focus:ring-0 text-gray-700 placeholder-gray-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Browse Local Flavors</h1>
            <p className="text-gray-500 text-sm">
              {loading
                ? 'Loading restaurants...'
                : `${filtered.length} restaurant${filtered.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-500 px-4 py-2.5 rounded-xl transition-all shadow-sm font-medium text-sm">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="font-medium text-gray-500">Fetching restaurants...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md w-full text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Could not load restaurants</h3>
              <p className="text-red-600 text-sm mb-2 font-mono bg-red-50 rounded-lg px-3 py-2">{error}</p>
              <p className="text-gray-400 text-xs mb-5">
                Make sure the FastAPI backend is running at <span className="font-bold text-gray-600">localhost:8000</span>
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.length > 0 ? (
              filtered.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))
            ) : (
              <div className="col-span-3 text-center py-24 text-gray-400 animate-fade-in">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold text-gray-500">No restaurants match your search.</p>
                <p className="text-sm mt-1">Try a different name or cuisine type.</p>
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-orange-500 hover:text-orange-600 font-semibold text-sm"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;


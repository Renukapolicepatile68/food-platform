import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Clock, ShieldCheck, MapPin, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-orange-500 p-2 rounded-xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-gray-900">
                Quick<span className="text-orange-500">Bite</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Home</a>
              <a href="#" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Restaurants</a>
              <a href="#" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Offers</a>
              <a href="#" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">About</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 font-semibold hover:text-orange-500 transition-colors px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-orange-500 transition-colors p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-lg">
              <a href="#" className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">Home</a>
              <a href="#" className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">Restaurants</a>
              <a href="#" className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">Offers</a>
              <div className="pt-4 flex flex-col gap-3">
                <Link to="/login" className="block w-full text-center border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-colors">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center gap-12">
          {/* Hero Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 font-medium text-sm mb-6 border border-orange-100">
              <Clock className="w-4 h-4" />
              <span>Fastest delivery in your city</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Craving something <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">delicious?</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
              Order your favorite meals from the best restaurants in town. Fresh, hot, and delivered straight to your door in under 30 minutes.
            </p>
            
            {/* Search Box / CTAs */}
            <div className="w-full max-w-md bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex items-center mb-8">
              <MapPin className="w-6 h-6 text-orange-500 ml-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Enter your delivery address" 
                className="w-full bg-transparent border-none focus:ring-0 px-4 text-gray-700 outline-none"
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all whitespace-nowrap hidden sm:block">
                Find Food
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
              <button className="sm:hidden bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all w-full">
                Find Food
              </button>
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group w-full sm:w-auto">
                Explore Menu
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link to="/login" className="inline-block text-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition-all w-full sm:w-auto">
                Login to Order
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-3">
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="User" />
                <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="User" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  +2k
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span>Happy customers</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-3xl transform scale-110 -z-10"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 ease-out border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3" 
                alt="Delicious food spread" 
                className="w-full h-auto object-cover max-h-[600px]"
              />
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Delivery</p>
                  <p className="font-bold text-gray-900">Under 30 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-2">Why Choose Us</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900">What makes us the best?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast Delivery</h4>
              <p className="text-gray-600 leading-relaxed">
                We pride ourselves on our speed. Get your food delivered hot and fresh in under 30 minutes, every time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col items-center text-center mt-0 md:mt-8">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-orange-500" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Trusted Restaurants</h4>
              <p className="text-gray-600 leading-relaxed">
                We partner only with the most highly-rated, hygienic, and premium restaurants in your area.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow group flex flex-col items-center text-center mt-0 md:mt-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-10 h-10 text-black" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Live Order Tracking</h4>
              <p className="text-gray-600 leading-relaxed">
                Know exactly where your food is with our real-time GPS tracking from the kitchen to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 mt-auto border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-orange-500 p-2 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">
                  Quick<span className="text-orange-500">Bite</span>
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Delivering happiness to your doorstep. The best food from top restaurants, delivered fast.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Services</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Add Restaurant</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Become a Courier</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Business Account</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">Gift Cards</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-lg font-bold mb-6">Get Updates</h4>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for exclusive offers and deals.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-800 text-white px-4 py-3 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-orange-500 w-full border border-gray-700"
                />
                <button className="bg-orange-500 hover:bg-orange-600 px-4 py-3 rounded-r-xl transition-colors text-white font-semibold flex items-center justify-center border border-orange-500 hover:border-orange-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} QuickBite. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

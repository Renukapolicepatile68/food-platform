import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ChevronRight } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  const { name, cuisine, rating, delivery_time, image_url } = restaurant;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          {rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2">{name}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full font-medium">
            {cuisine}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {delivery_time}
          </span>
        </div>

        <Link 
          to={`/restaurant/${restaurant.id}/menu`}
          className="w-full mt-4 bg-gray-50 hover:bg-orange-500 text-gray-900 hover:text-white border border-gray-200 hover:border-orange-500 font-semibold py-3 px-4 rounded-xl transition-colors group/btn flex items-center justify-center gap-2"
        >
          View Menu
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;


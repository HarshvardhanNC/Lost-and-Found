import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center relative text-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/images/campus.jpg)' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 px-5 max-w-3xl mx-auto">
        <h1 className="text-white font-bold mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide drop-shadow-lg">
          Lost & Found System
        </h1>
        <p className="text-indigo-100 mb-10 text-lg sm:text-xl md:text-2xl leading-relaxed drop-shadow-md font-medium">
          Report lost items and find what you're looking for on campus
        </p>
        <button
          onClick={() => navigate('/login')}
          className="relative overflow-hidden bg-blue-600 text-white px-9 py-3 text-xl font-semibold rounded-full border-2 border-transparent shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:bg-blue-700 active:scale-95 group"
        >
          <span className="relative z-10">Start Your Journey</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
        </button>
      </div>
    </div>
  );
};

export default Home;

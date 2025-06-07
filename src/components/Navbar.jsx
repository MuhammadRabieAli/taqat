/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/image.png';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/');
    window.location.reload(); // Optional: reload to reset state
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"
      >
        {isLoggedIn && (
          <div className="flex items-center gap-6">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition font-medium"
            >
              تسجيل الخروج
            </button>
            
            <Link
              to="/main"
              className="hover:text-red-400 transition text-lg font-medium"
            >
              الصفحة الرئيسية
            </Link>
            
            
          </div>
        )}

        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => navigate(isLoggedIn ? '/main' : '/')}
        >
          <motion.h1
            whileHover={{ scale: 1.05, color: '#ef4444' }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-wide font-sans text-white"
          >
            طاقات الصمود
          </motion.h1>

          <motion.img
            src={logo}
            alt="شعار الشركة"
            whileHover={{ rotate: 3, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full border-2 border-red-500 shadow-md"
          />

          
        </div>

        
      </motion.div>
    </header>
  );
};

export default Navbar;

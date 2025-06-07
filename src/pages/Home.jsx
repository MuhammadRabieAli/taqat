/* eslint-disable no-unused-vars */
import React from 'react'
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const handleDownload = async () => {
    const response = await fetch("https://taqat-api-3wara.vercel.app/api/tasks/export");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);


    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  
function Home() {

  const navigate = useNavigate()
  const handleLogout = ()=>{
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className='h-screen'> 
      <h1 className='text-center text-gray-900 font-bold text-3xl'>Hello In Home Pages </h1>

       <motion.button
            onClick={handleDownload}            
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center  gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-md transition-colors duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
            <Download className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
            تنزيل المهام
        </motion.button>

        <button onClick={handleLogout}>logout</button>
    </div>
  )
}

export default Home

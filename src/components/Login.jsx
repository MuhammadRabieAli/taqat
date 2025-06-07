/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import sideImage from '../assets/contact_img.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { successNotification } from './success';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Api, { ApiLink } from '../Config/Api';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await Api.post(`/api/auth/login`, {
                username,
                password,
            }).then((res) => {
                const msg = res.data.message;
                localStorage.setItem('token', res?.data?.token);
                successNotification(msg);
                navigate('/main');
            }).catch((err) => {
                console.log(err);
                
                const errMsg = err.response?.data?.message || 'فشل تسجيل الدخول';
                setError(errMsg);
            });

        } catch (err) {
            console.error(err);
            setError('حدث خطأ أثناء الاتصال بالخادم');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white animate-background">
            <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-2xl overflow-hidden animate-card">

                {/* Side image */}
                <div className="relative w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center animate-image">
                    <img
                        src={sideImage}
                        alt="صورة جانبية"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-800/20 backdrop-blur-[1px]" />
                    <div className="absolute z-10 bg-gray-800 text-white text-2xl md:text-3xl font-bold rounded-full w-40 h-40 flex items-center justify-center text-center shadow-lg">
                        طاقات الصمود
                    </div>
                </div>

                {/* Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center bg-red-800 p-10 animate-form">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8 animate-text">
                            <p className="text-white text-xl font-medium">تسجيل الدخول إلى النظام</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="username" dir="rtl" className="block text-lg font-semibold text-white mb-2">
                                    اسم المستخدم:
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    dir="rtl"
                                    className="w-full px-6 py-4 rounded-lg border border-gray-300 bg-transparent focus:ring-2 focus:ring-white focus:outline-none transition text-white placeholder-white text-base"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" dir="rtl" className="block text-lg font-semibold text-white mb-2">
                                    كلمة السر:
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        dir="rtl"
                                        className="w-full px-6 py-4 rounded-lg border border-gray-300 bg-transparent focus:ring-2 focus:ring-white focus:outline-none transition text-white placeholder-white text-base pr-12"
                                        placeholder="أدخل كلمة السر"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition"
                                        aria-label={showPassword ? "إخفاء كلمة السر" : "عرض كلمة السر"}
                                    >
                                        {showPassword ? <AiOutlineEyeInvisible size={24} /> : <AiOutlineEye size={24} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gray-800 text-white font-semibold py-4 rounded-lg shadow-md transition duration-300 text-lg
                                        hover:bg-white hover:text-red-800 hover:shadow-lg"
                            >
                                دخول
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

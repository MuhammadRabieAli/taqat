import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Api, { LocalApi } from "../Config/Api";
import { FiClock, FiUsers, FiFileText } from "react-icons/fi";

const SubMainDetails = () => {
    const { subId } = useParams();
    const navigate = useNavigate();
    const [subMain, setSubMain] = useState(null);

    console.log(subId);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        Api
            .get(`/api/sub-main/${subId}`, {
                headers: { Authorization: token },
            })
            .then((res) => setSubMain(res.data.subMain))
            .catch((err) => console.error("Error fetching sub-main:", err));
    }, [subId]);

    if (!subMain) return <div className="text-center mt-10">جاري التحميل...</div>;

    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-8 py-16 bg-gray-100">
            <h1 className="text-5xl font-bold mb-20 text-blue-900">{subMain.name}</h1>

            <div className="flex flex-col sm:flex-row justify-center gap-10 mb-20">
                <button 
                onClick={() => navigate(`/deadline/${subId}`)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-3xl font-bold px-28 py-6 rounded-full hover:from-blue-600 hover:to-indigo-700 transition duration-300 flex items-center gap-6">
                    <div className="bg-white text-blue-600 rounded-full p-3 shadow-md">
                        <FiClock className="text-4xl" />
                    </div>
                    Deadline
                </button>
                <button
                onClick={() => navigate(`/kader/${subId}`)}
                
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-3xl font-bold px-28 py-6 rounded-full hover:from-green-600 hover:to-emerald-700 transition duration-300 flex items-center gap-6">
                    <div className="bg-white text-green-600 rounded-full p-3 shadow-md">
                        <FiUsers className="text-4xl" />
                    </div>
                    الكادر
                </button>
                <button 
                onClick={() => navigate(`/tasks/${subId}`)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-3xl font-bold px-28 py-6 rounded-full hover:from-purple-600 hover:to-pink-700 transition duration-300 flex items-center gap-6">
                    <div className="bg-white text-purple-600 rounded-full p-3 shadow-md">
                        <FiFileText className="text-4xl" />
                    </div>
                    الفقرات
                </button>
            </div>

            <button
                onClick={() => navigate(-1)}
                className="bg-gray-800 text-white text-xl px-12 py-5 rounded-full hover:bg-gray-900 transition duration-300"
            >
                العودة للمواقع الفرعية
            </button>
        </div>
    );
};

export default SubMainDetails;

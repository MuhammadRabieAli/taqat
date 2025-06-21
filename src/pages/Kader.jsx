import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { IoMdClose } from 'react-icons/io';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Api from "../Config/Api";
import { successNotification } from '../components/success';
import { useTheme } from '../contexts/ThemeContext';

const Kader = () => {
  const { submainId } = useParams();
  const { isDark } = useTheme();
  const [data, setData] = useState([]);
  const [mainTitle, setMainTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", tasks: "" });
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [nameColors, setNameColors] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // استرجاع الألوان والتاريخ من localStorage
  useEffect(() => {
    const storedNameColors = localStorage.getItem('kaderNameColors');
    if (storedNameColors) {
      setNameColors(JSON.parse(storedNameColors));
    }

    const savedDate = localStorage.getItem("kaderDate");
    if (savedDate) {
      setDate(savedDate);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      localStorage.setItem("kaderDate", today);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [kaderRes, titleRes] = await Promise.all([
        Api.get(`/api/kader`),
        Api.get(`/api/tasks/get-name/${submainId}`, {
          headers: { Authorization: localStorage.getItem('token') },
        })
      ]);
      
      const filtered = kaderRes.data.data.filter(item => item.submainId === submainId);
      setData(filtered);
      setMainTitle(titleRes.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error('حدث خطأ أثناء جلب البيانات');
    }
  };

  useEffect(() => {
    fetchData();
  }, [submainId]);

  // Force re-render when theme changes
  useEffect(() => {
    console.log('Kader component theme changed:', isDark);
  }, [isDark]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    localStorage.setItem("kaderDate", newDate);
  };

  const handleColorChange = (color) => {
    if (formData.name.trim()) {
      const newNameColors = { ...nameColors, [formData.name]: color };
      setNameColors(newNameColors);
      localStorage.setItem('kaderNameColors', JSON.stringify(newNameColors));
      setShowColorPicker(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editId) {
        // في وضع التعديل، نرسل جميع الحقول كما هي
        // للأسماء الفارغة، نضع "غير محدد"
        const updateData = {
          name: formData.name && formData.name.trim() ? formData.name.trim() : 'غير محدد',
          tasks: formData.tasks && formData.tasks.trim() ? formData.tasks.trim() : ''
        };
        
        // إضافة معرف خاص للحقول المحذوفة
        if (!formData.name || formData.name.trim() === '') {
          updateData._deleteName = true;
        }
        if (!formData.tasks || formData.tasks.trim() === '') {
          updateData._deleteTasks = true;
        }
        
        console.log('Original form data:', formData);
        console.log('Sending Kader update data:', updateData);
        console.log('Edit ID:', editId);
        
        const response = await Api.patch(`/api/kader/${editId}`, updateData);
        
        console.log('Kader response data:', response.data);
        console.log('Updated kader data:', response.data.data);
        
        // تحقق من البيانات المحدثة
        if (response.data.data) {
          console.log('Updated name:', response.data.data.name);
          console.log('Updated tasks:', response.data.data.tasks);
        }
        
        successNotification('تم التحديث بنجاح');
      } else {
        // في وضع الإنشاء، نتأكد من وجود البيانات
        if (!formData.name.trim() && !formData.tasks.trim()) {
          toast.error('يجب إدخال الاسم أو المهام على الأقل');
          return;
        }
        await Api.post("/api/kader/add", { ...formData, submainId });
        successNotification('تم الإنشاء بنجاح');
      }
      await fetchData();
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    
    try {
      await Api.delete(`/api/kader/${id}`);
      setData(prev => prev.filter(item => item._id !== id));
      successNotification('تم الحذف بنجاح');
    } catch (err) {
      console.error("Delete error:", err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const openModal = (item = null) => {
    setShowModal(true);
    if (item) {
      setFormData({ name: item.name || "", tasks: item.tasks || "" });
      setEditId(item._id);
    } else {
      setFormData({ name: "", tasks: "" });
      setEditId(null);
    }
    setShowColorPicker(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", tasks: "" });
    setEditId(null);
    setShowColorPicker(false);
  };

  const availableColors = [
    { color: '#3b82f6', name: 'أزرق' },
    { color: '#10b981', name: 'أخضر' },
    { color: '#ec4899', name: 'زهري' },
  ];

  // دالة لحساب اللون المتباين للنص
  const getContrastColor = (hexColor) => {
    if (!hexColor) return '#000000';
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto min-h-screen bg-white dark:bg-gray-900" dir="rtl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 md:mb-8 flex-wrap gap-3 md:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-yellow-300">
          لجنة المتابعة - <span className="text-blue-600 dark:text-yellow-400">{mainTitle}</span>
        </h2>

        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto mt-3 sm:mt-0">
          {/* Date Section */}
          <div className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl shadow-md flex-1 sm:flex-auto">
            {editingDate ? (
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="border-2 border-gray-300 rounded-lg md:rounded-xl px-2 md:px-3 py-1 md:py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-lg font-medium w-full"
                onBlur={() => setEditingDate(false)}
                autoFocus
              />
            ) : (
              <span className="font-bold text-gray-800 dark:text-white text-sm md:text-lg truncate">
                التاريخ: {date}
              </span>
            )}
            <button
              onClick={() => setEditingDate(!editingDate)}
              className="text-yellow-500 hover:text-yellow-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex-shrink-0"
              title="تعديل التاريخ"
            >
              <FiEdit size={16} className="md:hidden" />
              <FiEdit size={18} className="hidden md:block" />
            </button>
          </div>

          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg md:rounded-xl transition-all shadow-lg text-sm md:text-base flex-1 sm:flex-auto justify-center"
          >
            <FiPlus /> إضافة كادر
          </motion.button>
        </div>
      </div>

      {/* Enhanced Modern Table Design */}
      <div className="relative overflow-x-auto overflow-y-hidden flex flex-col rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 border-2 sm:border-4 border-indigo-200 dark:border-indigo-800">

        {data.length === 0 ? (
          <div className="p-6 md:p-12 text-center text-gray-600 dark:text-gray-300 text-xl md:text-2xl font-bold">
            <div className="mb-4 md:mb-6">
              <FiPlus className="mx-auto text-6xl md:text-8xl text-gray-400 mb-4 md:mb-6" />
            </div>
            لا توجد بيانات للكادر
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full table-auto border-separate border-spacing-0">
              <thead className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-1 sm:px-3 md:px-6 py-1 sm:py-3 md:py-5 text-center text-[10px] sm:text-sm md:text-lg font-bold uppercase tracking-wider border border-white/20 first:rounded-tl-md md:first:rounded-tl-xl">
                    <span>الاسم</span>
                  </th>
                  <th className="px-1 sm:px-3 md:px-6 py-1 sm:py-3 md:py-5 text-center text-[10px] sm:text-sm md:text-lg font-bold uppercase tracking-wider border border-white/20">
                    <span>المهام</span>
                  </th>
                  <th className="px-1 sm:px-3 md:px-6 py-1 sm:py-3 md:py-5 text-center text-[10px] sm:text-sm md:text-lg font-bold uppercase tracking-wider border border-white/20 first:rounded-tr-md md:first:rounded-tr-xl w-[40px] sm:w-auto">
                    <span>العمليات</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                {data.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                      dark:hover:from-gray-700 dark:hover:to-gray-600 
                      transition-all duration-300 transform hover:scale-[1.01]
                      ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/80' : 'bg-gray-50/80 dark:bg-gray-900/80'}
                    `}
                  >
                    <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-3 md:py-4 text-center border border-indigo-100 dark:border-indigo-800/50 whitespace-normal">
                      <div 
                        className="inline-block px-1 sm:px-2 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-sm sm:rounded-md md:rounded-lg text-[10px] sm:text-xs md:text-base font-bold sm:font-black shadow border border-white/50 truncate w-full"
                        style={{ 
                          backgroundColor: nameColors[item.name] || '#6366f1',
                          color: getContrastColor(nameColors[item.name] || '#6366f1'),
                        }}
                      >
                        {item.name || 'غير محدد'}
                      </div>
                    </td>
                    <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-3 md:py-4 text-center text-[9px] sm:text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 border border-indigo-100 dark:border-indigo-800/50 whitespace-normal">
                      <div className="w-full mx-auto bg-blue-50 dark:bg-blue-900/30 p-0.5 sm:p-1 md:p-2 rounded-sm sm:rounded-md">
                        <div className="whitespace-normal break-words">
                          {item.tasks || 'لا توجد مهام'}
                        </div>
                      </div>
                    </td>
                    <td className="px-0.5 sm:px-1 md:px-2 py-1 sm:py-2 md:py-3 text-center border border-indigo-100 dark:border-indigo-800/50">
                      <div className="flex justify-center items-center gap-0.5 sm:gap-1">
                        <button
                          onClick={() => openModal(item)}
                          className="p-0.5 sm:p-1 md:p-1.5 bg-amber-400 hover:bg-amber-500 text-white rounded-sm sm:rounded-md transition-colors"
                          title="تعديل"
                        >
                          <FiEdit size={8} className="sm:hidden" />
                          <FiEdit size={10} className="hidden sm:inline md:hidden" />
                          <FiEdit size={14} className="hidden md:inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-0.5 sm:p-1 md:p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-sm sm:rounded-md transition-colors"
                          title="حذف"
                        >
                          <FiTrash2 size={8} className="sm:hidden" />
                          <FiTrash2 size={10} className="hidden sm:inline md:hidden" />
                          <FiTrash2 size={14} className="hidden md:inline" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
            dir="rtl"
            lang="ar"
          >
            <button
              onClick={closeModal}
              className="absolute top-2 sm:top-4 left-2 sm:left-4 text-gray-600 dark:text-white hover:text-red-500 transition-colors"
              disabled={isSubmitting}
            >
              <IoMdClose size={24} className="sm:hidden" />
              <IoMdClose size={28} className="hidden sm:block" />
            </button>

            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white text-right pr-2">
              {editId ? "تعديل بيانات الكادر" : "إضافة كادر جديد"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 text-right">
              <div>
                <label className="block text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 dark:text-gray-200 font-black">
                  اسم الموظف
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 border-2 border-gray-300 focus:border-blue-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-base sm:text-xl font-bold transition-colors"
                    placeholder="ادخل اسم الموظف"
                  />
                  {formData.name.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl transition-all shadow-lg"
                      title="اختر لون الاسم"
                    >
                      🎨
                    </button>
                  )}
                </div>
                
                {/* Color Picker */}
                {showColorPicker && formData.name.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 sm:mt-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-300">اختر لون الاسم:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(({ color, name }) => (
                        <motion.button
                          key={color}
                          type="button"
                          onClick={() => handleColorChange(color)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-lg transition-all hover:shadow-xl"
                          style={{ backgroundColor: color }}
                          title={name}
                        />
                      ))}
                    </div>
                    {nameColors[formData.name] && (
                      <div className="mt-2 sm:mt-3 p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium text-center text-white" 
                           style={{ backgroundColor: nameColors[formData.name] }}>
                        اللون المختار لـ {formData.name}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 dark:text-gray-200 font-black">
                  المهام
                </label>
                <textarea
                  name="tasks"
                  value={formData.tasks}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 focus:border-blue-500 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-base sm:text-xl font-bold transition-colors"
                  rows={4}
                  placeholder="ادخل المهام"
                />
              </div>

              <div className="flex justify-start gap-2 sm:gap-4 pt-4 sm:pt-6">
                <motion.button
                  type="button"
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg sm:rounded-xl transition-all hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold text-sm sm:text-lg"
                  disabled={isSubmitting}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl transition-all flex items-center gap-1 sm:gap-2 font-semibold text-sm sm:text-lg shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editId ? 'جاري التحديث...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    editId ? 'تحديث' : 'إضافة'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Kader;

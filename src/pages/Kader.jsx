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
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-white" dir="rtl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-yellow-300">
          لجنة المتابعة - <span className="text-blue-600 dark:text-yellow-400">{mainTitle}</span>
        </h2>

        <div className="flex items-center gap-4">
          {/* Date Section */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-xl shadow-md">
            {editingDate ? (
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="border-2 border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                onBlur={() => setEditingDate(false)}
                autoFocus
              />
            ) : (
              <span className="font-bold text-gray-800 dark:text-white text-lg">
                التاريخ: {date}
              </span>
            )}
            <button
              onClick={() => setEditingDate(!editingDate)}
              className="text-yellow-500 hover:text-yellow-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="تعديل التاريخ"
            >
              <FiEdit size={18} />
            </button>
          </div>

          {/* Add Button */}
          <motion.button
            onClick={() => openModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all shadow-lg"
          >
            <FiPlus /> إضافة كادر
          </motion.button>
        </div>
      </div>

      {/* Enhanced Modern Table Design */}
      <div className="overflow-x-auto rounded-3xl shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 border-4 border-indigo-200 dark:border-indigo-800">
        {data.length === 0 ? (
          <div className="p-12 text-center text-gray-600 dark:text-gray-300 text-2xl font-bold">
            <div className="mb-6">
              <FiPlus className="mx-auto text-8xl text-gray-400 mb-6" />
            </div>
            لا توجد بيانات للكادر
          </div>
        ) : (
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white">
              <tr>
                <th className="px-8 py-6 text-center text-2xl font-black uppercase tracking-wider border-2 border-white/20 first:rounded-tl-2xl">
                  <div className="flex items-center justify-center gap-2">
                    <span>👤</span>
                    <span>الاسم</span>
                  </div>
                </th>
                <th className="px-8 py-6 text-center text-2xl font-black uppercase tracking-wider border-2 border-white/20">
                  <div className="flex items-center justify-center gap-2">
                    <span>📋</span>
                    <span>المهام</span>
                  </div>
                </th>
                <th className="px-8 py-6 text-center text-2xl font-black uppercase tracking-wider border-2 border-white/20 first:rounded-tr-2xl">
                  <div className="flex items-center justify-center gap-2">
                    <span>⚙️</span>
                    <span>العمليات</span>
                  </div>
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
                  <td className="px-8 py-8 text-center border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div 
                      className="inline-block px-6 py-4 rounded-2xl text-2xl font-black shadow-lg border-2 border-white/50"
                      style={{ 
                        backgroundColor: nameColors[item.name] || '#6366f1',
                        color: getContrastColor(nameColors[item.name] || '#6366f1'),
                      }}
                    >
                      {item.name || 'غير محدد'}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center text-xl font-black text-gray-800 dark:text-gray-200 border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div className="max-w-xs mx-auto bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                      {item.tasks || 'لا توجد مهام'}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex justify-center gap-4">
                      <motion.button
                        onClick={() => openModal(item)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-2xl transition-all shadow-xl border-2 border-white/50"
                        title="تعديل"
                      >
                        <FiEdit size={20} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(item._id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl transition-all shadow-xl border-2 border-white/50"
                        title="حذف"
                      >
                        <FiTrash2 size={20} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-[90%] max-w-2xl border border-gray-200 dark:border-gray-700"
            dir="rtl"
            lang="ar"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 left-4 text-gray-600 dark:text-white hover:text-red-500 transition-colors"
              disabled={isSubmitting}
            >
              <IoMdClose size={28} />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-right">
              {editId ? "تعديل بيانات الكادر" : "إضافة كادر جديد"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6 text-right">
              <div>
                <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">
                  اسم الموظف
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="flex-1 border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                    placeholder="ادخل اسم الموظف"
                  />
                  {formData.name.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg"
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
                    className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">اختر لون الاسم:</p>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(({ color, name }) => (
                        <motion.button
                          key={color}
                          type="button"
                          onClick={() => handleColorChange(color)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-lg transition-all hover:shadow-xl"
                          style={{ backgroundColor: color }}
                          title={name}
                        />
                      ))}
                    </div>
                    {nameColors[formData.name] && (
                      <div className="mt-3 p-2 rounded-lg text-sm font-medium text-center text-white" 
                           style={{ backgroundColor: nameColors[formData.name] }}>
                        اللون المختار لـ {formData.name}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">
                  المهام
                </label>
                <textarea
                  name="tasks"
                  value={formData.tasks}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                  rows={4}
                  placeholder="ادخل المهام"
                />
              </div>

              <div className="flex justify-start gap-4 pt-6">
                <motion.button
                  type="button"
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-xl transition-all hover:bg-gray-400 dark:hover:bg-gray-500 font-semibold text-lg"
                  disabled={isSubmitting}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all flex items-center gap-2 font-semibold text-lg shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

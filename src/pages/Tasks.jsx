/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Api, { LocalApi } from '../Config/Api';
import { motion } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { successNotification } from '../components/success';
import { useTheme } from '../contexts/ThemeContext';

function Tasks() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [mainTitle, setMainTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [savedDate, setSavedDate] = useState('');
  const [nameColors, setNameColors] = useState({});
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // استرجاع التاريخ المحفوظ من localStorage عند التحميل
  useEffect(() => {
    const storedDate = localStorage.getItem(`savedDate_${id}`);
    if (storedDate) {
      setSavedDate(storedDate);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setSavedDate(today);
    }

    const storedNameColors = localStorage.getItem('nameColors');
    if (storedNameColors) {
      setNameColors(JSON.parse(storedNameColors));
    }
  }, [id]);

  const defaultForm = {
    submainId: id,
    username: '',
    date: new Date().toISOString().split('T')[0],
    tasks: '',
    remainingWork: '',
    number: '',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mainRes, taskRes] = await Promise.all([
        Api.get(`/api/tasks/get-name/${id}`, {
          headers: { Authorization: localStorage.getItem('token') },
        }),
        Api.get(`/api/tasks/getbySubId/${id}`, {
          headers: { Authorization: localStorage.getItem('token') },
        }),
      ]);

      setMainTitle(mainRes.data.data);
      setTasks(taskRes.data.tasks);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Force re-render when theme changes
  useEffect(() => {
    console.log('Tasks component theme changed:', isDark);
  }, [isDark]);

  // الحصول على جميع الأرقام الفريدة من المهام
  const uniqueNumbers = [...new Set(tasks.map(task => task.number).filter(num => num !== '' && num !== null && num !== undefined))].sort((a, b) => a - b);

  // فلترة المهام بناءً على الأرقام المحددة
  const filteredTasks = selectedNumbers.length === 0 
    ? tasks 
    : tasks.filter(task => selectedNumbers.includes(task.number));

  const handleNumberFilter = (number) => {
    setSelectedNumbers(prev => 
      prev.includes(number) 
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  const clearAllFilters = () => {
    setSelectedNumbers([]);
  };

  const selectAllNumbers = () => {
    setSelectedNumbers([...uniqueNumbers]);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    setIsDeleting(true);
    try {
      await Api.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: localStorage.getItem('token') },
      });
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      successNotification('Deleted Successfully');
    } catch (error) {
      console.error(error);
      toast.error('فشل في حذف المهمة');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAdd = () => {
    setShowModal(true);
    setIsEditing(false);
    setEditTaskId(null);
    setForm({ ...defaultForm, submainId: id });
  };

  const handleEdit = (task) => {
    setShowModal(true);
    setIsEditing(true);
    setEditTaskId(task._id);
    setForm({
      submainId: task.submainId?._id || id,
      username: task.username || '',
      date: task.date ? task.date.split('T')[0] : new Date().toISOString().split('T')[0],
      tasks: task.tasks || '',
      remainingWork: task.remainingWork || '',
      number: task.number || '',
      notes: task.notes || '',
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditTaskId(null);
    setForm({ ...defaultForm, submainId: id });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color) => {
    if (form.username.trim()) {
    const newNameColors = { ...nameColors, [form.username]: color };
    setNameColors(newNameColors);
    localStorage.setItem('nameColors', JSON.stringify(newNameColors));
      setShowColorPicker(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // بناء البيانات - في وضع التعديل نرسل جميع الحقول حتى لو كانت فارغة للسماح بالحذف
    const cleanedForm = {
    submainId: id,
    };

    if (isEditing) {
      // في وضع التعديل، نرسل جميع الحقول حتى لو كانت فارغة
      // نرسل سلسلة فارغة للحقول المحذوفة
      cleanedForm.username = form.username.trim() === '' ? '' : form.username;
      cleanedForm.date = form.date || '';
      cleanedForm.tasks = form.tasks.trim() === '' ? '' : form.tasks;
      cleanedForm.remainingWork = form.remainingWork.trim() === '' ? '' : form.remainingWork;
      cleanedForm.number = form.number === '' ? '' : form.number;
      cleanedForm.notes = form.notes.trim() === '' ? '' : form.notes;
    } else {
      // في وضع الإنشاء، نرسل فقط الحقول التي تحتوي على قيم
      if (form.username.trim()) cleanedForm.username = form.username;
      if (form.date) cleanedForm.date = form.date;
      if (form.tasks.trim()) cleanedForm.tasks = form.tasks;
      if (form.remainingWork.trim()) cleanedForm.remainingWork = form.remainingWork;
      if (form.number !== '') cleanedForm.number = form.number;
      if (form.notes.trim()) cleanedForm.notes = form.notes;
    }

    // إضافة تسجيل للتشخيص
    console.log('Sending data:', cleanedForm);

    try {
      if (isEditing) {
        const res = await Api.patch(
          `/api/tasks/${editTaskId}`,
          cleanedForm,
          { headers: { Authorization: localStorage.getItem('token') } }
        );
        
        console.log('Response data:', res.data);
        
        setTasks((prev) =>
          prev.map((task) => (task._id === editTaskId ? res.data.data : task))
        );
        
        // إعادة جلب البيانات للتأكد من التحديث
        fetchData();
        
        successNotification('تم التحديث بنجاح');
      } else {
        const res = await Api.post(
          '/api/tasks/create-task',
          cleanedForm,
          { headers: { Authorization: localStorage.getItem('token') } }
        );
        setTasks((prev) => [...prev, res.data.task]);
        successNotification('تم الإنشاء بنجاح');
      }
      handleModalClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await Api.get(`/api/tasks/export-data/${id}`, {
        responseType: 'blob',
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks_${id}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      successNotification('تم تنزيل الفقرات بنجاح');
    } catch (error) {
      console.error("Download failed:", error);
      toast.error('فشل في تصدير المهام');
    }
  };

  const handleSaveDate = (newDate) => {
    localStorage.setItem(`savedDate_${id}`, newDate);
    setSavedDate(newDate);
    setShowDateModal(false);
    successNotification('تم حفظ التاريخ بنجاح');
  };

  const handleEditDate = () => {
    setShowDateModal(true);
  };

  const availableColors = [
    { color: '#3b82f6', name: 'أزرق' }, // أزرق
    { color: '#10b981', name: 'أخضر' }, // أخضر
    { color: '#ec4899', name: 'زهري' }, // زهري
  ];

  return (
    <div dir="rtl" lang="ar" className="container m-auto p-4 min-h-screen bg-white">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-300">
          المهام الخاصة بـ <span className="text-blue-600 dark:text-yellow-400">{mainTitle}</span>
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-xl shadow-md">
            <span className="font-bold text-gray-800 dark:text-white text-lg">
              التاريخ: {savedDate}
            </span>
            <button
              onClick={handleEditDate}
              className="text-yellow-500 hover:text-yellow-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title="تعديل التاريخ"
            >
              <FiEdit size={18} />
            </button>
          </div>

          <div className="flex gap-3">
            <motion.button
              onClick={handleAdd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all shadow-lg"
            >
              <FiPlus /> إضافة فقرة
            </motion.button>

            <motion.button
              onClick={() => setShowFilterModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all shadow-lg"
            >
              فلترة الأرقام
              {selectedNumbers.length > 0 && (
                <span className="bg-white text-blue-600 rounded-full px-2 py-1 text-xs font-bold">
                  {selectedNumbers.length}
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:from-red-400 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            >
              <Download className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
              تنزيل الفقرات
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filter Display */}
      {selectedNumbers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-md"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-blue-800 dark:text-blue-200 font-bold text-lg">الأرقام المفلترة:</span>
            {selectedNumbers.map(num => (
              <motion.span
                key={num}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md"
              >
                {num}
                <button
                  onClick={() => handleNumberFilter(num)}
                  className="hover:bg-blue-700 rounded-full p-1 transition-colors"
                >
                  <IoMdClose size={14} />
                </button>
              </motion.span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline font-medium"
            >
              إزالة جميع الفلاتر
            </button>
          </div>
        </motion.div>
      )}

      {/* Enhanced Modern Table Design */}
      <div className="overflow-x-auto rounded-3xl shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 border-4 border-indigo-200 dark:border-indigo-800">
        {loading ? (
          <div className="p-12 text-center text-gray-600 dark:text-gray-300 text-2xl font-bold">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6"></div>
            جاري التحميل...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-600 dark:text-gray-300 text-2xl font-bold">
            {selectedNumbers.length > 0 ? 'لا توجد مهام تطابق الفلتر المحدد' : 'لا توجد فقرات لعرضها'}
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
                <th className="px-8 py-6 text-center text-2xl font-black uppercase tracking-wider border-2 border-white/20">
                  <div className="flex items-center justify-center gap-2">
                    <span>📝</span>
                    <span>الملاحظات</span>
                  </div>
                </th>
                <th className="px-8 py-6 text-center text-2xl font-black uppercase tracking-wider border-2 border-white/20">
                  <div className="flex items-center justify-center gap-2">
                    <span>🔢</span>
                    <span>ت</span>
                  </div>
                </th>
                <th className="px-8 py-6 text-center text-2xl font-black uppercase tracking-wider border-2 border-white/20">
                  <div className="flex items-center justify-center gap-2">
                    <span>⏳</span>
                    <span>العمل المتبقي</span>
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
              {filteredTasks.map((task, index) => (
                <motion.tr
                  key={task._id}
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
                        backgroundColor: task.usernameColor || nameColors[task.username] || '#6366f1',
                        color: getContrastColor(task.usernameColor || nameColors[task.username] || '#6366f1'),
                      }}
                    >
                      {task.username || 'غير محدد'}
                    </div>
                  </td>  
                  <td className="px-8 py-8 text-center text-xl font-black text-gray-800 dark:text-gray-200 border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div className="max-w-xs mx-auto bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                      {task.tasks || 'لا توجد مهام'}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center text-xl font-black text-gray-800 dark:text-gray-200 border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div className="max-w-xs mx-auto bg-green-50 dark:bg-green-900/30 p-4 rounded-xl truncate" title={task.notes}>
                      {task.notes || 'لا توجد ملاحظات'}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center border-2 border-indigo-100 dark:border-indigo-800/50">
                    <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-full text-2xl font-black shadow-lg">
                      {task.number || '0'}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-center text-xl font-black text-gray-800 dark:text-gray-200 border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div className="max-w-xs mx-auto bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl">
                      {task.remainingWork || 'لا يوجد عمل متبقي'}
                    </div>
                  </td>
                  
                  <td className="px-8 py-8 text-center border-2 border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex justify-center gap-4">
                      <motion.button
                        onClick={() => handleEdit(task)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-2xl transition-all shadow-xl border-2 border-white/50"
                        title="تعديل"
                        disabled={isDeleting}
                      >
                        <FiEdit size={20} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(task._id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl transition-all shadow-xl border-2 border-white/50"
                        title="حذف"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <FiTrash2 size={20} />
                        )}
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
            className="relative bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            dir="rtl"
            lang="ar"
          >
            <button
              onClick={handleModalClose}
              className="absolute top-4 left-4 text-gray-600 dark:text-white hover:text-red-500 transition-colors"
              disabled={isSubmitting}
            >
              <IoMdClose size={28} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-right">
              {isEditing ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 text-right">
              <div className="space-y-6">
                <div>
                  <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">التاريخ</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                  />
                </div>
        
                <div>
                  <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">اسم الموظف</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleFormChange}
                      className="flex-1 border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                      placeholder="أدخل اسم الموظف"
                      list="usernames-list"
                    />
                    <datalist id="usernames-list">
                      {[...new Set(tasks.map(task => task.username).filter(Boolean))].map((name, index) => (
                        <option key={index} value={name} />
                      ))}
                    </datalist>
                    {form.username.trim() && (
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
                  {showColorPicker && form.username.trim() && (
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
                      {nameColors[form.username] && (
                        <div className="mt-3 p-2 rounded-lg text-sm font-medium text-center text-white" 
                             style={{ backgroundColor: nameColors[form.username] }}>
                          اللون المختار لـ {form.username}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">المهام</label>
                  <textarea
                    name="tasks"
                    value={form.tasks}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                    rows={4}
                    placeholder="أدخل المهام المطلوبة"
                  />
                </div>

                <div>
                  <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">الملاحظات</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                    rows={3}
                    placeholder="أدخل أي ملاحظات إضافية"
                  />
                </div>

                <div>
                  <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">رقم التسلسل</label>
                  <input
                    type="number"
                    name="number"
                    value={form.number}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                    min="0"
                    placeholder="أدخل رقم التسلسل"
                  />
                </div>

                <div>
                  <label className="block text-xl mb-3 text-gray-900 dark:text-gray-200 font-black">العمل المتبقي للموقع</label>
                  <textarea
                    name="remainingWork"
                    value={form.remainingWork}
                    onChange={handleFormChange}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xl font-bold transition-colors"
                    rows={3}
                    placeholder="أدخل المهام المتبقية"
                  />
                </div>
              </div>

              <div className="flex justify-start gap-4 pt-6">
                <motion.button
                  type="button"
                  onClick={handleModalClose}
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
                      {isEditing ? 'جاري التحديث...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    isEditing ? 'تحديث' : 'حفظ'
                  )}
                </motion.button>
        </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Filter Modal */}
      {showFilterModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-[90%] max-w-md border border-gray-200 dark:border-gray-700"
            dir="rtl"
            lang="ar"
          >
            <button
              onClick={() => setShowFilterModal(false)}
              className="absolute top-3 left-3 text-gray-600 dark:text-white hover:text-red-500 transition-colors"
            >
              <IoMdClose size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-right">
              فلترة بالأرقام
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <motion.button
                  onClick={selectAllNumbers}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm transition-all font-semibold shadow-lg"
                >
                  تحديد الكل
                </motion.button>
                <motion.button
                  onClick={clearAllFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-sm transition-all font-semibold shadow-lg"
                >
                  إزالة الكل
                </motion.button>
              </div>

              <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  {uniqueNumbers.map(num => (
                    <motion.button
                      key={num}
                      onClick={() => handleNumberFilter(num)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-md
                        ${selectedNumbers.includes(num) 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }
                      `}
                    >
                      {num}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4">
                <motion.button
                  onClick={() => setShowFilterModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all font-semibold shadow-lg"
                >
                  إغلاق
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[90%] max-w-md"
            dir="rtl"
            lang="ar"
          >
            <button
              onClick={() => setShowDateModal(false)}
              className="absolute top-3 left-3 text-gray-600 dark:text-white hover:text-red-500 transition"
            >
              <IoMdClose size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-right">
              تعديل التاريخ
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">
                  اختر تاريخ جديد
                </label>
                <input
                  type="date"
                  value={savedDate}
                  onChange={(e) => setSavedDate(e.target.value)}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-start gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded transition hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDate(savedDate)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  حفظ
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}


    </div>
  );
}

function getContrastColor(hexColor) {
  if (!hexColor || hexColor === '#ffffff' || hexColor === '#fff') {
    return '#000000';
  }
  
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#ffffff';
}

export default Tasks;

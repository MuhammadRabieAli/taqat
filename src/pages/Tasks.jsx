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

function Tasks() {
  const { id } = useParams();
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
    setForm((prev) => ({ ...prev, usernameColor: color }));
    
    const newNameColors = { ...nameColors, [form.username]: color };
    setNameColors(newNameColors);
    localStorage.setItem('nameColors', JSON.stringify(newNameColors));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanedForm = {
    submainId: id,
    ...(form.username && { username: form.username }),
    ...(form.date && { date: form.date }),
    ...(form.tasks && { tasks: form.tasks }),
    ...(form.remainingWork && { remainingWork: form.remainingWork }),
    ...(form.number && { number: form.number }),
    ...(form.notes && { notes: form.notes }),
  };

    try {
      if (isEditing) {
        const res = await Api.patch(
          `/api/tasks/${editTaskId}`,
          cleanedForm,
          { headers: { Authorization: localStorage.getItem('token') } }
        );
        setTasks((prev) =>
          prev.map((task) => (task._id === editTaskId ? res.data.data : task))
        );
        successNotification('Updated Successfully');
      } else {
        const res = await Api.post(
          '/api/tasks/create-task',
          cleanedForm,
          { headers: { Authorization: localStorage.getItem('token') } }
        );
        setTasks((prev) => [...prev, res.data.task]);
        successNotification('Created Successfully');
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
    '#3b82f6', // أزرق
    '#10b981', // أخضر
    '#ec4899', // وردي
  ];

  return (
    <div dir="rtl" lang="ar" className="container m-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          المهام الخاصة بـ {mainTitle}
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <span className="font-medium text-gray-800 dark:text-white">
              التاريخ: {savedDate}
            </span>
            <button
              onClick={handleEditDate}
              className="text-yellow-500 hover:text-yellow-600 dark:text-blue-400 dark:hover:text-blue-300"
              title="تعديل التاريخ"
            >
              <FiEdit size={18} />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-3 py-3 bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition"
            >
              <FiPlus /> إضافة فقرة
            </button>

            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              فلترة الأرقام
              {selectedNumbers.length > 0 && (
                <span className="bg-white text-blue-600 rounded-full px-2 py-1 text-xs font-bold">
                  {selectedNumbers.length}
                </span>
              )}
            </button>

            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-md transition-colors duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
            >
              <Download className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
              تنزيل الفقرات
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filter Display */}
      {selectedNumbers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-blue-800 dark:text-blue-200 font-medium">الأرقام المفلترة:</span>
            {selectedNumbers.map(num => (
              <span key={num} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-full text-sm">
                {num}
                <button
                  onClick={() => handleNumberFilter(num)}
                  className="hover:bg-blue-700 rounded-full p-0.5"
                >
                  <IoMdClose size={14} />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline"
            >
              إزالة جميع الفلاتر
            </button>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
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
              onClick={() => setShowFilterModal(false)}
              className="absolute top-3 left-3 text-gray-600 dark:text-white hover:text-red-500 transition"
            >
              <IoMdClose size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-right">
              فلترة بالأرقام
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={selectAllNumbers}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                >
                  تحديد الكل
                </button>
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition"
                >
                  إلغاء الكل
                </button>
              </div>

              {uniqueNumbers.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center">لا توجد أرقام متاحة للفلترة</p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {uniqueNumbers.map(number => (
                    <label key={number} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedNumbers.includes(number)}
                        onChange={() => handleNumberFilter(number)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-gray-900 dark:text-white font-medium">رقم {number}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        ({tasks.filter(task => task.number === number).length} مهمة)
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex justify-start gap-2 pt-4">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                >
                  تطبيق الفلتر
                </button>
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

      <div className="overflow-x-auto rounded-lg shadow-lg bg-white dark:bg-gray-800">
        {loading ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-300">جاري التحميل...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-300">
            {selectedNumbers.length > 0 ? 'لا توجد مهام تطابق الفلتر المحدد' : 'لا توجد فقرات لعرضها'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">الاسم</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">المهام</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">الملاحظات</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">ت </th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">العمل المتبقي للموقع</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">العمليات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td 
                    className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200"
                    style={{ 
                      backgroundColor: task.usernameColor || nameColors[task.username] || '#ffffff',
                      color: getContrastColor(task.usernameColor || nameColors[task.username] || '#ffffff')
                    }}
                  >
                    {task.username || ''}
                  </td>  
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.tasks || ''}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200 max-w-xs truncate">
                    {task.notes || ''}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.number || ''}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.remainingWork || ''}</td>
                  
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full transition"
                        title="تعديل"
                        disabled={isDeleting}
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                        title="حذف"
                        disabled={isDeleting}
                      >
                        {isDeleting ? '...' : <FiTrash2 />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
            dir="rtl"
            lang="ar"
          >
            <button
              onClick={handleModalClose}
              className="absolute top-3 left-3 text-gray-600 dark:text-white hover:text-red-500 transition"
              disabled={isSubmitting}
            >
              <IoMdClose size={24} />
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white text-right">
              {isEditing ? 'تعديل المهمة' : 'إضافة مهمة'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">التاريخ</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
        
              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">الاسم</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="أدخل اسم المسؤول"
                />
              </div>

              

              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">المهام</label>
                <textarea
                  name="tasks"
                  value={form.tasks}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  rows={3}
                  placeholder="أدخل المهام المطلوبة"
                />
              </div>
              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">الملاحظات</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  rows={3}
                  placeholder="أدخل أي ملاحظات إضافية"
                />
              </div>
              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold"> ت </label>
                <input
                  type="number"
                  name="number"
                  value={form.number}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">العمل المتبقي للموقع</label>
                <textarea
                  name="remainingWork"
                  value={form.remainingWork}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  rows={3}
                  placeholder="أدخل المهام المتبقية"
                />
              </div>

              <div className="flex justify-start gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded transition hover:bg-gray-400 dark:hover:bg-gray-500"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center gap-2"
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
                </button>
              </div>
            </form>
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

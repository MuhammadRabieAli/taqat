import React from 'react'

function data() {
  return (
    <div dir="rtl" lang="ar" className="container m-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          المهام الخاصة بـ {mainTitle}
        </h1>

        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-3 bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <FiPlus /> إضافة فقرة
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white dark:bg-gray-800">
        {loading ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-300">جاري التحميل...</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-300">لا توجد فقرات لعرضها</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">الاسم</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">المهام</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">الملاحظات</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">رقم الفقرة</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">العمل المتبقي للموقع</th>
                <th className="px-6 py-3 text-center text-1xl font-bold text-gray-700 dark:text-white">العمليات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {tasks.map((task) => (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.username || '-'}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.tasks || '-'}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200 max-w-xs truncate">
                    {task.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.number || '-'}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200">{task.remainingWork || '-'}</td>
                  
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

      {/* Modal */}
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
                <label className="block text-1xl my-3 text-gray-900 dark:text-gray-200 font-bold">رقم الفقره</label>
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
  )
}

export default data

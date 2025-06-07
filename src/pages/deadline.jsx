import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Api from "../Config/Api";

const Deadline = () => {
  const { submainId } = useParams();
  const [data, setData] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [dateForm, setDateForm] = useState({ date: "" });
  const [notesForm, setNotesForm] = useState({ notes: "" });
  const [editId, setEditId] = useState(null);
  const [todayDate, setTodayDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setTodayDate(formattedDate);
    setDateForm({ date: formattedDate });
    fetchData();
  }, [submainId]);

 
  
  const fetchData = async () => {
  try {
    setLoading(true);
    const res = await Api.get(`/api/deadline?submainId=${submainId}`);
    const responseData = res.data?.data || [];

    // فلترة البيانات حسب submainId والملاحظات
    const filteredData = responseData.filter(
      (item) => item.submainId === submainId
    );

    setData(filteredData);

    // تحديد التاريخ الحالي (اختياريًا من أول عنصر فيه تاريخ)
    const savedDate = filteredData.find((item) => item.date);
    if (savedDate) {
      setDateForm({ date: savedDate.date });
      setTodayDate(savedDate.date);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};


  const handleDateChange = (e) => {
    setDateForm({ date: e.target.value });
  };

  const handleNotesChange = (e) => {
    setNotesForm({ notes: e.target.value });
  };

  const handleDateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await Api.patch(`/api/deadline/${editId}`, {
          ...dateForm,
        });
      } else {
        await Api.post("/api/deadline/add", {
          ...dateForm,
          submainId,
        });
      }
      setTodayDate(dateForm.date);
      setEditId(null);
      closeDateModal();
      await fetchData();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await Api.patch(`/api/deadline/${editId}`, {
          ...notesForm,
        });
      } else {
        await Api.post("/api/deadline/add", {
          ...notesForm,
          submainId,
        });
      }
      setEditId(null);
      closeNotesModal();
      await fetchData();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/deadline/${id}`);
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openDateModal = (item = null) => {
    setShowDateModal(true);
    if (item) {
      setDateForm({ date: item.date });
      setEditId(item._id);
    } else {
      setDateForm({ date: todayDate });
      setEditId(null);
    }
  };

  const openNotesModal = (item = null) => {
    setShowNotesModal(true);
    if (item) {
      setNotesForm({ notes: item.notes });
      setEditId(item._id);
    } else {
      setNotesForm({ notes: "" });
      setEditId(null);
    }
  };

  const closeDateModal = () => {
    setShowDateModal(false);
    setEditId(null);
  };

  const closeNotesModal = () => {
    setShowNotesModal(false);
    setEditId(null);
  };

  const dateData = data?.find((item) => item?.date) || null;
  const notesData = data?.filter((item) => item?.notes) || [];

  if (loading) {
    return <div className="p-6 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* عرض التاريخ */}
      <div className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-900">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Deadline</h2>
            <p className="text-2xl text-gray-600">{todayDate}</p>
          </div>
          <div className="space-x-3 space-x-reverse">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded shadow transition"
              onClick={() => openDateModal(dateData)}
            >
              تعديل
            </button>
          </div>
        </div>
      </div>

      {/* عنوان الملاحظات وزر الإضافة */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">الملاحظات</h2>
        <button
          className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-lg shadow transition"
          onClick={() => openNotesModal()}
        >
          + إضافة ملاحظة
        </button>
      </div>

      {/* عرض الملاحظات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notesData.length > 0 ? (
          notesData.map((item) => (
            <motion.div
              key={item._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition"
              whileHover={{ scale: 1.02 }}
            >
              <div className="min-h-[100px]">
                <p className="text-gray-700">{item.notes}</p>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse mt-4">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow transition"
                  onClick={() => openNotesModal(item)}
                >
                  تعديل
                </button>
                 <button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow transition mx-4"
                    onClick={() => handleDelete(item._id)}
                    >
                    حذف
               </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            لا توجد ملاحظات مسجلة.
          </div>
        )}
      </div>

      {/* مودال التاريخ */}
      {showDateModal && (
        <motion.div
          className="fixed inset-0 bg-zinc-900/75 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editId ? "تعديل التاريخ" : "إضافة تاريخ جديد"}
            </h3>
            <form onSubmit={handleDateSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  التاريخ
                </label>
                <input
                  type="date"
                  name="date"
                  value={dateForm.date}
                  onChange={handleDateChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                  onClick={closeDateModal}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition mx-4"
                >
                  {editId ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* مودال الملاحظات */}
      {showNotesModal && (
        <motion.div
          className="fixed inset-0 bg-zinc-900/75 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editId ? "تعديل الملاحظة" : "إضافة ملاحظة جديدة"}
            </h3>
            <form onSubmit={handleNotesSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  الملاحظات
                </label>
                <textarea
                  name="notes"
                  value={notesForm.notes}
                  onChange={handleNotesChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="أدخل الملاحظات هنا..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                  onClick={closeNotesModal}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition mx-4"
                >
                  {editId ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Deadline;

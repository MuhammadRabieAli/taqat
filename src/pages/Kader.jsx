import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Api from "../Config/Api";

const Kader = () => {
  const { submainId } = useParams();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", tasks: "" });
  const [editId, setEditId] = useState(null);
  const [date, setDate] = useState(""); // حالة التاريخ
  const [editingDate, setEditingDate] = useState(false); // لتفعيل تعديل التاريخ

  // const fetchData = async () => {
  //   try {
  //     const res = await Api.get(`/api/kader`);
  //     setData(res.data.data);
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //   }
  // };
  const fetchData = async () => {
  try {
    const res = await Api.get(`/api/kader`);
    const filtered = res.data.data.filter(item => item.submainId === submainId);
    setData(filtered);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};


  useEffect(() => {
    fetchData();

    // قراءة التاريخ من localStorage أو تعيين تاريخ اليوم
    const savedDate = localStorage.getItem("kaderDate");
    if (savedDate) {
      setDate(savedDate);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      localStorage.setItem("kaderDate", today);
    }
  }, [fetchData, submainId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    localStorage.setItem("kaderDate", newDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await Api.patch(`/api/kader/${editId}`, formData);
      } else {
        await Api.post("/api/kader/add", { ...formData, submainId });
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Api.delete(`/api/kader/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openModal = (item = null) => {
    setShowModal(true);
    if (item) {
      setFormData({ name: item.name, tasks: item.tasks });
      setEditId(item._id);
    } else {
      setFormData({ name: "", tasks: "" });
      setEditId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", tasks: "" });
    setEditId(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* العنوان والتاريخ وزر تعديل التاريخ وزر الإضافة في صف واحد */}
      <div className="flex justify-between items-center mb-6">
        {/* العنوان */}
        <h2 className="text-2xl font-bold text-gray-800">لجنة المتابعة</h2>

        {/* التاريخ + زر تعديل التاريخ */}
        <div className="flex items-center gap-3">
          {editingDate ? (
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span className="text-gray-700 text-lg font-medium">
              {date}
            </span>
          )}

          <button
            onClick={() => setEditingDate(!editingDate)}
            className="px-3 py-1 text-sm rounded bg-yellow-500 text-white hover:bg-yellow-700 transition"
          >
            {editingDate ? "حفظ " : "تعديل "}
          </button>
        </div>

        {/* زر الإضافة */}
        <button
          className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2 rounded-lg shadow transition"
          onClick={() => openModal()}
        >
          + إضافة كادر
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="w-full bg-white table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">المهام</th>
              <th className="px-4 py-3 text-center">العمليات</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item) => (
              <tr key={item._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.tasks}</td>
                <td className="px-4 py-3 text-center space-x-2 space-x-reverse">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded shadow transition mx-6"
                    onClick={() => openModal(item)}
                  >
                    تعديل
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded shadow transition"
                    onClick={() => handleDelete(item._id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  لا توجد بيانات للكادر.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
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
              {editId ? "تعديل بيانات الكادر" : "إضافة كادر جديد"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  الاسم
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ادخل الاسم"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  المهام
                </label>
                <input
                  type="text"
                  name="tasks"
                  value={formData.tasks}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ادخل المهام"
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                  onClick={closeModal}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded transition"
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

export default Kader;

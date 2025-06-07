import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPlus, FiEdit, FiTrash } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Api, { LocalApi } from "../Config/Api";
import { successNotification } from "../components/success";

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { delay: 0.1 } },
};

const gradients = [
  "from-rose-500 to-pink-700",
  "from-pink-600 to-purple-800",
  "from-purple-500 to-indigo-800",
  "from-indigo-600 to-blue-900",
  "from-blue-500 to-cyan-700",
  "from-cyan-500 to-teal-700",
  "from-teal-500 to-emerald-700",
  "from-emerald-500 to-green-700",
  "from-green-500 to-lime-700",
  "from-yellow-400 to-amber-600",
  "from-amber-500 to-orange-600",
  "from-orange-500 to-red-700",
  "from-red-500 to-rose-800",
];

const MainTable = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem("token");
    Api
      .get(`/api/main`, {
        headers: { Authorization: token },
      })
      .then((res) => setData(res.data.data))
      .catch((err) => console.error("Error fetching data:", err));
  };

  const handleAddClick = () => {
    setEditingData(null);
    setFormData({ name: "" });
    setModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingData(item);
    setFormData({ name: item.name });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
    if (confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
      Api
        .delete(`/api/main/${id}`, {
          headers: { Authorization: token },
        })
        .then(() => {
          successNotification("تم الحذف بنجاح");
          fetchData();
        })
        .catch((err) => console.error("Error deleting item:", err));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = editingData ? "patch" : "post";
    const url = editingData
      ? `/api/main/${editingData._id}`
      : `/api/main/create-main`;

    Api({
      method,
      url,
      data: formData,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then(() => {
        setModalOpen(false);
        successNotification(editingData ? "تم التعديل بنجاح" : "تم الإضافة بنجاح");
        fetchData();
      })
      .catch((err) => console.error("Error submitting data:", err));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-10 mt-20">
        <h1 className="text-3xl font-extrabold text-center">المواقع الرئيسية</h1>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          <FiPlus />
          إضافة موقع رئيسي
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {data.length > 0 ? (
          data.map((item) => {
            const randomGradient =
              gradients[Math.floor(Math.random() * gradients.length)];

            return (
              <div
                key={item._id}
                className={`bg-gradient-to-br ${randomGradient} text-white rounded-2xl shadow-2xl p-8 h-64 flex flex-col items-center justify-between transition-transform hover:scale-105 duration-300`}
              >
                <div className="flex-1 flex items-center justify-center">
                  <h2
                    onClick={() => navigate(`/sub-main/${item._id}`)}
                    className="text-2xl font-bold text-center cursor-pointer w-32 h-32 flex items-center justify-center rounded-full hover:bg-white/20 hover:ring-4 hover:ring-white/30 transition duration-300"
                  >
                    {item.name}
                  </h2>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex items-center gap-1 bg-yellow-200 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded"
                  >
                    <FiEdit />
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center gap-1 bg-red-400 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded"
                  >
                    <FiTrash />
                    حذف
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center col-span-full text-gray-500 dark:text-gray-300 py-10">
            لا توجد بيانات
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-full max-w-md"
              variants={modal}
            >
              <h2 className="text-lg font-bold mb-4">
                {editingData ? "تعديل موقع" : "إضافة موقع جديد"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="اسم الموقع"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
                  >
                    {editingData ? "تحديث" : "إضافة"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainTable;

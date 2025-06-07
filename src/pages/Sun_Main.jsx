import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  "from-pink-200 via-red-200 to-yellow-200",
  "from-green-200 via-blue-200 to-purple-200",
  "from-purple-200 via-pink-200 to-red-200",
  "from-yellow-100 via-green-100 to-blue-200",
  "from-indigo-200 via-purple-200 to-pink-200",
  "from-teal-200 via-cyan-200 to-blue-200",
  "from-rose-200 via-fuchsia-200 to-purple-200",
  "from-lime-200 via-green-300 to-emerald-200",
  "from-orange-200 via-amber-200 to-yellow-200",
  "from-sky-200 via-cyan-300 to-blue-300",
  "from-purple-300 via-indigo-300 to-blue-300",
  "from-pink-100 via-red-100 to-yellow-100",
  "from-emerald-200 via-teal-300 to-cyan-400",
  "from-yellow-300 via-orange-300 to-red-400",
  "from-cyan-300 via-blue-400 to-indigo-500",
  "from-fuchsia-300 via-pink-400 to-red-500",
];

const getRandomGradient = (usedGradients) => {
  const availableGradients = gradients.filter(
    (g) => !usedGradients.current.includes(g)
  );
  let choice;
  if (availableGradients.length === 0) {
    usedGradients.current = [];
    choice = gradients[Math.floor(Math.random() * gradients.length)];
  } else {
    choice =
      availableGradients[Math.floor(Math.random() * availableGradients.length)];
  }
  usedGradients.current.push(choice);
  if (usedGradients.current.length > 5) {
    usedGradients.current.shift();
  }
  return choice;
};

const Sub_Main = () => {
  const [data, setData] = useState([]);
  const [mainOptions, setMainOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({ name: "", mainId: "" });
  const [currentMain, setCurrentMain] = useState(null);
  const { mainId } = useParams();

  const navigate = useNavigate();
  const usedGradients = useRef([]);

  useEffect(() => {
    fetchData();
    fetchMainOptions();
    fetchCurrentMain();
  }, [mainId]);

  const fetchData = () => {
    const token = localStorage.getItem("token");
    Api
      .get(`/api/sub-main?mainId=${mainId}`, {
        headers: { Authorization: token },
      })
      .then((res) => setData(res.data.data))
      .catch((err) => console.error("Error fetching data:", err));
  };

  const fetchMainOptions = () => {
    const token = localStorage.getItem("token");
    Api
      .get(`/api/main`, {
        headers: { Authorization: token },
      })
      .then((res) => setMainOptions(res.data.data))
      .catch((err) => console.error("Error fetching main options:", err));
  };

  const fetchCurrentMain = () => {
    if (!mainId) return;
    const token = localStorage.getItem("token");
    Api
      .get(`/api/main/${mainId}`, {
        headers: { Authorization: token },
      })
      .then((res) => setCurrentMain(res.data.data))
      .catch((err) => console.error("Error fetching current main:", err));
  };

  const handleAddClick = () => {
    setEditingData(null);
    setFormData({ name: "", mainId: mainId || "" });
    setModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingData(item);
    setFormData({ name: item.name, mainId: item.mainId?._id || "" });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
    if (confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
      Api
        .delete(`/api/sub-main/${id}`, {
          headers: { Authorization: token },
        })
        .then(() => {
          successNotification("تم الحذف بنجاح ");
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
      ? `/api/sub-main/${editingData._id}`
      : `/api/sub-main/create-submain`;

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
        successNotification(
          method === "post" ? "تم اضافه الموقع بنجاح" : "تم التعديل بنجاح "
        );
        fetchData();
      })
      .catch((err) => console.error("Error submitting data:", err));
  };

  return (
    <div className="p-4 max-w-6xl mx-auto min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-10 mt-10">
        <button
          onClick={() => navigate("/main")}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          العودة للمواقع الرئيسية
        </button>
        <h1 className="text-3xl font-bold">المواقع الفرعية</h1>
        {currentMain && (
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mx-4">
            الموقع الرئيسي: {currentMain.name}
          </h2>
        )}
        <button
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          onClick={handleAddClick}
        >
          <FiPlus /> إضافة موقع فرعي
        </button>
      </div>

      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
          exit={{ opacity: 0 }}
        >
          {data.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-10 text-gray-500 dark:text-gray-400 col-span-full"
            >
              لا توجد بيانات
            </motion.div>
          )}

          {data.map((item) => {
            const bgGradient = getRandomGradient(usedGradients);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className={`cursor-pointer rounded-xl p-10 bg-gradient-to-r ${bgGradient} shadow-lg max-w-full mx-auto`}
              >
                <div
                  onClick={() => navigate(`/sub-main/details/${item._id}`)}
                  className="flex justify-center items-center text-center font-extrabold text-5xl select-none hover:shadow-[0_0_0_4px_rgba(255,255,255,0.7)] rounded-full transition-shadow duration-300 ease-in-out w-52 aspect-square mx-auto text-gray-800"
                >
                  {item.name}
                </div>
                <div className="flex justify-center mt-6 gap-3">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex items-center gap-1 bg-yellow-200 hover:bg-yellow-500 text-black font-semibold px-3 py-1 rounded"
                  >
                    <FiEdit /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center gap-1 bg-red-400 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded"
                  >
                    <FiTrash /> حذف
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full bg-gray-950/75 bg-opacity-40 flex items-center justify-center z-50"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-[90%] max-w-md"
              variants={modal}
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingData ? "تعديل موقع" : "إضافة موقع جديد"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">الاسم</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">الموقع الرئيسي</label>
                  <select
                    name="mainId"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                    value={formData.mainId}
                    onChange={(e) =>
                      setFormData({ ...formData, mainId: e.target.value })
                    }
                    required
                  >
                    <option value="">اختر الموقع الرئيسي</option>
                    {mainOptions.map((main) => (
                      <option key={main._id} value={main._id}>
                        {main.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
                    onClick={() => setModalOpen(false)}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
                  >
                    {editingData ? "تعديل" : "إضافة"}
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

export default Sub_Main;

/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: { y: "0", opacity: 1, transition: { delay: 0.1 } },
};

const MainModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({ name: "", description: "" });
    }
  }, [initialData]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50"
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
              {initialData ? "تعديل العنصر" : "إضافة عنصر جديد"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">الاسم</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">الوصف</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500 text-white"
                  onClick={onClose}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white"
                >
                  {initialData ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MainModal;

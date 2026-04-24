"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Trash2, Edit3, Save, X, Clock, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimelineJournal() {
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", mood_color: "bg-white", image_url: "" });
  const [showForm, setShowForm] = useState(false);

  const moodColors = [
    { name: "สีขาว (ทั่วไป)", class: "bg-white", border: "border-gray-200" },
    { name: "สีฟ้า (ผ่อนคลาย)", class: "bg-blue-100", border: "border-blue-200" },
    { name: "สีเขียว (สดชื่น)", class: "bg-green-100", border: "border-green-200" },
    { name: "สีเหลือง (มีความสุข)", class: "bg-yellow-100", border: "border-yellow-200" },
    { name: "สีแดง (มีพลัง)", class: "bg-red-100", border: "border-red-200" },
    { name: "สีม่วง (เพ้อฝัน)", class: "bg-purple-100", border: "border-purple-200" },
    { name: "สีชมพู (ความรัก)", class: "bg-pink-100", border: "border-pink-200" },
    { name: "สีส้ม (กระตือรือร้น)", class: "bg-orange-100", border: "border-orange-200" },
    { name: "สีเทา (สงบนิ่ง)", class: "bg-slate-100", border: "border-slate-200" },
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await fetch("/api/notes");
    const data = await res.json();
    if (Array.isArray(data)) {
      setNotes(data);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert("กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน");
      return;
    }

    const url = isEditing ? `/api/notes/${isEditing}` : "/api/notes";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ title: "", content: "", mood_color: "bg-white", image_url: "" });
        setIsEditing(null);
        setShowForm(false);
        fetchNotes();
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || "ไม่สามารถบันทึกได้"}`);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleEdit = (note) => {
    setIsEditing(note.id);
    setFormData({ 
      title: note.title, 
      content: note.content, 
      mood_color: note.mood_color, 
      image_url: note.image_url || "" 
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบบันทึกนี้?")) {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) fetchNotes();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-white py-12 px-5 sm:px-10 overflow-hidden relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10 bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3"> 
              จดบันทึก <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">เรื่องราว</span>
              <Sparkles className="text-yellow-400" size={28} />
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">บันทึกทุกความทรงจำและความรู้สึกของคุณ</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: showForm ? -90 : 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setShowForm(!showForm); setIsEditing(null); setFormData({ title: "", content: "", mood_color: "bg-white", image_url: "" }); }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
          >
            {showForm ? <X size={24} /> : <Plus size={24} />}
          </motion.button>
        </motion.div>

        {/* Form Section */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  {isEditing ? "✨ แก้ไขบันทึก" : "✍️ เขียนบันทึกใหม่"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">หัวข้อเรื่อง</label>
                        <input
                          type="text"
                          placeholder="วันนี้มีอะไรน่าสนใจ..."
                          className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">รายละเอียด</label>
                        <textarea
                          placeholder="เล่าเรื่องราวของคุณเลย..."
                          className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl h-40 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">รูปภาพประกอบ</label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label 
                            htmlFor="image-upload"
                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all overflow-hidden relative"
                          >
                            {formData.image_url ? (
                              <>
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <ImageIcon className="text-white" size={32} />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="text-gray-400 mb-2" size={32} />
                                <p className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพ</p>
                              </div>
                            )}
                          </label>
                          {formData.image_url && (
                            <button 
                              type="button" 
                              onClick={() => setFormData({ ...formData, image_url: "" })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">มู้ดของวันนี้ (สี)</label>
                        <div className="flex flex-wrap gap-3">
                          {moodColors.map((mood) => (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              key={mood.class}
                              type="button"
                              onClick={() => setFormData({ ...formData, mood_color: mood.class })}
                              className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${mood.class} ${formData.mood_color === mood.class ? 'border-gray-800 ring-4 ring-gray-800/20 scale-110' : mood.border}`}
                              title={mood.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20"
                    >
                      <Save size={20} /> {isEditing ? "บันทึกการแก้ไข" : "บันทึกเรื่องราว"}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button" 
                      onClick={() => setShowForm(false)} 
                      className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      ยกเลิก
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline List */}
        <div className="relative ml-4 md:ml-8 mt-12 pb-20">
          {/* Main vertical line */}
          <div className="absolute left-0 top-4 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-transparent rounded-full" />
          
          <AnimatePresence>
            {notes.length > 0 ? (
              notes.map((note, index) => {
                const noteMood = moodColors.find(m => m.class === note.mood_color) || moodColors[0];
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    key={note.id} 
                    className="relative ml-10 mb-10 group"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[46px] top-6 w-8 h-8 bg-white rounded-full border-4 border-blue-400 shadow-md z-10 flex items-center justify-center group-hover:scale-110 group-hover:border-purple-500 transition-all duration-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-purple-500 transition-colors" />
                    </div>
                    
                    {/* Note Card */}
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className={`p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-xl border border-white/60 transition-all duration-300 backdrop-blur-sm relative overflow-hidden ${note.mood_color || 'bg-white'}`}
                    >
                      {/* Decorative top border based on mood */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 opacity-50 ${note.mood_color && note.mood_color !== 'bg-white' ? note.mood_color.replace('100', '400') : 'bg-gray-200'}`} />
                      
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                              {format(new Date(note.created_at), "d MMMM yyyy", { locale: th })}
                              <span className="w-1 h-1 bg-gray-400/30 rounded-full"></span>
                              <span className="text-gray-400 font-normal">{format(new Date(note.created_at), "HH:mm")}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute top-6 right-6 md:static">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(note)} 
                            className="p-2.5 bg-white text-blue-600 hover:text-blue-700 shadow-sm hover:shadow border border-gray-100 rounded-full transition-all"
                          >
                            <Edit3 size={18} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(note.id)} 
                            className="p-2.5 bg-white text-red-500 hover:text-red-600 shadow-sm hover:shadow border border-gray-100 rounded-full transition-all"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-snug">{note.title}</h3>
                      
                      {note.image_url && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                          <img src={note.image_url} alt={note.title} className="w-full h-auto object-cover max-h-96" />
                        </div>
                      )}
                      
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">{note.content}</p>
                    </motion.div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-10 bg-white/50 backdrop-blur-sm border border-dashed border-gray-300 rounded-3xl p-10 text-center"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-blue-400" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">ยังไม่มีบันทึก</h3>
                <p className="text-gray-500">เริ่มต้นบันทึกเรื่องราวและความทรงจำแรกของคุณได้เลย!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

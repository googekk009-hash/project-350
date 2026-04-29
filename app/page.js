"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Trash2, Edit3, Save, X, Sparkles, Image as ImageIcon, LogOut, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const Background = () => (
  <>
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </>
);

export default function TimelineJournal() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading', 'authenticated', 'unauthenticated'
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", mood_color: "bg-white", image_url: "" });
  const [showForm, setShowForm] = useState(false);
  
  // Auth state
  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  const router = useRouter();

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

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setStatus("authenticated");
        fetchNotes();
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch (err) {
      setStatus("unauthenticated");
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setNotes(data);
      }
    } catch (err) {
      console.error("Fetch notes error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/register";
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });

      const data = await res.json();

      if (res.ok) {
        if (authMode === "register") {
          setAuthMode("login");
          setAuthError("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
        } else {
          fetchUser();
        }
      } else {
        setAuthError(data.message === "Invalid email or password" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : data.message || "เกิดข้อผิดพลาดในการยืนยันตัวตน");
      }
    } catch (err) {
      setAuthError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStatus("unauthenticated");
    setNotes([]);
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
    if (!formData.title || !formData.content) return alert("กรุณากรอกหัวข้อและรายละเอียดให้ครบถ้วน");

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
      }
    } catch (error) {
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleEdit = (note) => {
    setIsEditing(note.id);
    setFormData({ title: note.title, content: note.content, mood_color: note.mood_color, image_url: note.image_url || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบบันทึกนี้?")) {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (res.ok) fetchNotes();
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-white flex items-center justify-center px-4 overflow-hidden relative">
        <Background />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight flex items-center justify-center gap-3"> จดบันทึก <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">เรื่องราว</span> <Sparkles className="text-yellow-400" size={28} /></h1>
            <p className="text-gray-500 mt-2 font-medium">{authMode === "login" ? "ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบ" : "เริ่มบันทึกเรื่องราวของคุณวันนี้"}</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อของคุณ</label>
                <input type="text" required className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="ชื่อ-นามสกุล" value={authData.name} onChange={(e) => setAuthData({...authData, name: e.target.value})} />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">อีเมล</label>
              <input type="email" required className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="example@email.com" value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสผ่าน</label>
              <input type="password" required className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} />
            </div>
            {authError && <p className={`text-sm text-center font-medium ${authError.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'}`}>{authError}</p>}
            <button type="submit" disabled={authLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {authLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : authMode === "login" ? <><LogIn size={20} /> เข้าสู่ระบบ</> : <><UserPlus size={20} /> ลงทะเบียน</>}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
              {authMode === "login" ? "ยังไม่มีบัญชี? ลงทะเบียนที่นี่" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-white py-12 px-5 sm:px-10 overflow-hidden relative">
      <Background />
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/60 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight flex items-center gap-3"> จดบันทึก <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">เรื่องราว</span> <Sparkles className="text-yellow-400" size={28} /></h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">สวัสดีคุณ {user.name || user.email} | บันทึกทุกความทรงจำของคุณ</p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="bg-white text-red-500 border border-red-100 p-4 rounded-2xl shadow-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium" title="ออกจากระบบ"><LogOut size={20} /> <span className="hidden md:inline">ออกจากระบบ</span></motion.button>
            <motion.button whileHover={{ scale: 1.05, rotate: showForm ? -90 : 90 }} whileTap={{ scale: 0.95 }} onClick={() => { setShowForm(!showForm); setIsEditing(null); setFormData({ title: "", content: "", mood_color: "bg-white", image_url: "" }); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center">{showForm ? <X size={24} /> : <Plus size={24} />}</motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-10">
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? "✨ แก้ไขบันทึก" : "✍️ เขียนบันทึกใหม่"}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">หัวข้อเรื่อง</label>
                        <input type="text" placeholder="วันนี้มีอะไรน่าสนใจ..." className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl outline-none transition-all" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">รายละเอียด</label>
                        <textarea placeholder="เล่าเรื่องราวของคุณเลย..." className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl h-40 outline-none transition-all resize-none" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">รูปภาพประกอบ</label>
                        <div className="relative group">
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload" />
                          <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 overflow-hidden relative">
                            {formData.image_url ? <img src={formData.image_url} alt="ตัวอย่าง" className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon className="text-gray-400 mx-auto mb-2" size={32} /><p className="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพ</p></div>}
                          </label>
                          {formData.image_url && <button type="button" onClick={() => setFormData({ ...formData, image_url: "" })} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"><X size={14} /></button>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">มู้ดของวันนี้ (สี)</label>
                        <div className="flex flex-wrap gap-3">
                          {moodColors.map((mood) => (
                            <button key={mood.class} type="button" title={mood.name} onClick={() => setFormData({ ...formData, mood_color: mood.class })} className={`w-8 h-8 rounded-full border-2 transition-all ${mood.class} ${formData.mood_color === mood.class ? 'border-gray-800 ring-4 ring-gray-800/20' : mood.border}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"><Save size={20} /> {isEditing ? "บันทึกการแก้ไข" : "บันทึกเรื่องราว"}</button>
                    <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold">ยกเลิก</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative ml-4 md:ml-8 mt-12 pb-20">
          <div className="absolute left-0 top-4 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-transparent rounded-full" />
          <AnimatePresence>
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.4, delay: index * 0.1 }} key={note.id} className="relative ml-10 mb-10 group">
                  <div className="absolute -left-[46px] top-6 w-8 h-8 bg-white rounded-full border-4 border-blue-400 shadow-md z-10 flex items-center justify-center"><div className="w-2 h-2 bg-blue-500 rounded-full" /></div>
                  <div className={`p-6 md:p-8 rounded-3xl shadow-sm border border-white/60 relative overflow-hidden ${note.mood_color || 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-sm font-medium text-gray-600">{format(new Date(note.created_at), "d MMMM yyyy", { locale: th })} เวลา {format(new Date(note.created_at), "HH:mm")} น.</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEdit(note)} className="p-2 bg-white text-blue-600 border border-gray-100 rounded-full" title="แก้ไข"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(note.id)} className="p-2 bg-white text-red-500 border border-gray-100 rounded-full" title="ลบ"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{note.title}</h3>
                    {note.image_url && <div className="mb-4 rounded-2xl overflow-hidden max-w-md"><img src={note.image_url} alt={note.title} className="w-full h-auto object-cover max-h-64" /></div>}
                    <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="ml-10 bg-white/50 border border-dashed border-gray-300 rounded-3xl p-10 text-center">
                <Sparkles className="text-blue-400 mx-auto mb-4" size={28} />
                <h3 className="text-lg font-bold text-gray-700">ยังไม่มีบันทึก</h3>
                <p className="text-gray-500 mt-1">เริ่มต้นบันทึกเรื่องราวและความทรงจำแรกของคุณได้เลย!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

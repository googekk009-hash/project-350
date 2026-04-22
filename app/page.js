"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus, Trash2, Edit3, Save, X, Clock } from "lucide-react";

export default function TimelineJournal() {
  const [notes, setNotes] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "", mood_color: "bg-white" });
  const [showForm, setShowForm] = useState(false);

  const moodColors = [
    { name: "สีขาว (ทั่วไป)", class: "bg-white" },
    { name: "สีฟ้า (ผ่อนคลาย)", class: "bg-blue-100" },
    { name: "สีเขียว (สดชื่น)", class: "bg-green-100" },
    { name: "สีเหลือง (มีความสุข)", class: "bg-yellow-100" },
    { name: "สีแดง (มีพลัง)", class: "bg-red-100" },
    { name: "สีม่วง (เพ้อฝัน)", class: "bg-purple-100" },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/api/notes/${isEditing}` : "/api/notes";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ title: "", content: "", mood_color: "bg-white" });
      setIsEditing(null);
      setShowForm(false);
      fetchNotes();
    }
  };

  const handleEdit = (note) => {
    setIsEditing(note.id);
    setFormData({ title: note.title, content: note.content, mood_color: note.mood_color });
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
    <div className="min-h-screen bg-gray-50 py-10 px-5 sm:px-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight"> จดบันทึก <span className="text-blue-600">ข้อมูล </span></h1>
          <button 
            onClick={() => { setShowForm(!showForm); setIsEditing(null); setFormData({ title: "", content: "", mood_color: "bg-white" }); }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
          >
            {showForm ? <X size={24} /> : <Plus size={24} />}
          </button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-10 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{isEditing ? "แก้ไขบันทึก" : "เขียนบันทึกใหม่"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="หัวข้อเรื่อง..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="จดสิ่งที่อยากคิดมาเลย"
                className="w-full p-3 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">เลือกอารมณ์ (สี)</label>
                <div className="flex flex-wrap gap-3">
                  {moodColors.map((mood) => (
                    <button
                      key={mood.class}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood_color: mood.class })}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${mood.class} ${formData.mood_color === mood.class ? 'border-blue-600 scale-110' : 'border-gray-200'}`}
                      title={mood.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Save size={20} /> {isEditing ? "อัปเดตบันทึก" : "บันทึกข้อมูล"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Timeline List */}
        <div className="relative border-l-4 border-blue-200 ml-4 md:ml-6 space-y-12 pb-10">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="relative ml-8 group">
                {/* Timeline Dot */}
                <div className="absolute -left-[40px] top-6 w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-md z-10 group-hover:scale-125 transition-transform" />
                
                {/* Note Card */}
                <div className={`p-6 rounded-2xl shadow-md border border-gray-100 transition-all hover:shadow-xl ${note.mood_color}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 bg-opacity-50 px-3 py-1 rounded-full">
                      <Clock size={14} />
                      {format(new Date(note.created_at), "d MMMM yyyy HH:mm", { locale: th })}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(note)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{note.title}</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="ml-8 text-gray-400 italic py-10">เริ่มบันทึกความทรงจำแรกได้เลย!</div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { VITE_API_URL } from '../config';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

function Section() {
  const [sections, setSections] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [search, setSearch] = useState("");
  const [dictionaryFilter, setDictionaryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState({ show: false, msg: '', success: true });
  const [form, setForm] = useState({ name: '', related_dic: '', image: null, imageUrl: '' });
  const [loading, setLoading] = useState(false);

  // Fetch dictionaries
  const fetchDictionaries = async () => {
    try {
      const { data } = await axios.get(`${VITE_API_URL}/dictionary/get-all`);
      if (data.success) setDictionaries(data.data);
    } catch (e) { }
  };

  // Fetch sections
  const fetchSections = async (dictionaryId = null) => {
    let url = dictionaryId && dictionaryId !== 'all'
      ? `${VITE_API_URL}/section/by-dictionary/${dictionaryId}`
      : `${VITE_API_URL}/section/get-all`;
    try {
      const { data } = await axios.get(url);
      if (data.success) setSections(data.data);
    } catch (e) { }
  };

  useEffect(() => {
    fetchDictionaries();
    fetchSections();
  }, []);

  // Filtering and search
  const filtered = sections.filter(s => {
    let ok = true;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) ok = false;
    if (dictionaryFilter !== 'all' && s.related_dic?._id !== dictionaryFilter) ok = false;
    return ok;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal open/close
  const openModal = (mode, sec = null) => {
    setModalMode(mode);
    setShowModal(true);
    if (mode === 'edit' && sec) {
      setEditing(sec._id);
      setForm({
        name: sec.name,
        related_dic: sec.related_dic?._id || '',
        image: null,
        imageUrl: sec.image || ''
      });
    } else {
      setEditing(null);
      setForm({ name: '', related_dic: '', image: null, imageUrl: '' });
    }
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', related_dic: '', image: null, imageUrl: '' }); };

  // Form change
  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0], imageUrl: files[0] ? URL.createObjectURL(files[0]) : '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Add/Edit
  const handleSubmit = async e => {
    e.preventDefault();
    // Formani tekshirish
    const nameVal = (form.name ?? '').toString().trim();
    const dicVal = (form.related_dic ?? '').toString().trim();

    console.log('Yuborilayotgan name:', form.name, '| related_dic:', form.related_dic);

    if (!nameVal) {
      setAlert({ show: true, msg: "Bo'lim nomini kiritish majburiy!", success: false });
      return;
    }
    if (!dicVal) {
      setAlert({ show: true, msg: "Lug'atni tanlash majburiy!", success: false });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('name', nameVal);
    formData.append('related_dic', dicVal);

    if (form.image && typeof form.image !== 'string') {
      formData.append('image', form.image);
    }
    const url = editing
      ? `${VITE_API_URL}/section/update/${editing}`
      : `${VITE_API_URL}/section/add`;
    const method = editing ? 'put' : 'post';
    try {
      const { data } = await axios[method](url, formData);
      if (data.success) {
        setAlert({ show: true, msg: editing ? "Bo'lim muvaffaqiyatli tahrirlandi!" : "Bo'lim muvaffaqiyatli qo'shildi!", success: true });
        fetchSections(dictionaryFilter);
        closeModal();
      } else {
        setAlert({ show: true, msg: data.message || "Ma'lumot saqlanmadi.", success: false });
      }
    } catch (err) {
      
      console.log('BACKEND ERROR:', err.response?.data || err);

      setAlert({ show: true, msg: err.response?.data?.message || "Xatolik yuz berdi!", success: false });
    }
    setLoading(false);
    setTimeout(() => setAlert({ show: false, msg: '', success: true }), 3000);
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm("Haqiqatan ham ushbu bo'limni o'chirmoqchimisiz?")) return;
    try {
      const { data } = await axios.delete(`${VITE_API_URL}/section/delete/${id}`);
      setAlert({ show: true, msg: data.msg || "Bo'lim muvaffaqiyatli o'chirildi!", success: data.success });
      fetchSections(dictionaryFilter);
    } catch (err) {
      setAlert({ show: true, msg: err.response?.data?.message || "Bo'limni o'chirishda xatolik yuz berdi!", success: false });
    }
    setTimeout(() => setAlert({ show: false, msg: '', success: true }), 3000);
  };

  // Remove image (in modal)
  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image: null, imageUrl: '' }));
  };

  // Pagination
  const handlePage = p => setPage(p);

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="flex items-center gap-4 mb-4">
        <select value={dictionaryFilter} onChange={e => { setDictionaryFilter(e.target.value); setPage(1); fetchSections(e.target.value); }} className="border px-3 py-2 rounded">
          <option value="all">Barchasi</option>
          {dictionaries.map(d => (
            <option key={d._id} value={d._id}>{d.name} {d.type ? `(${d.type})` : ''}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Bo'limlarni qidirish..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded flex-1"
        />
        <button onClick={() => openModal('add')} className="bg-black text-white px-4 py-2 rounded">+ Bo'lim qo'shish</button>
      </div>

      {/* Alert */}
      {alert.show && (
        <div className={`mb-4 px-4 py-2 rounded ${alert.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{alert.msg}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 font-semibold text-gray-700">#</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Nomi</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Lug'at</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Rasm</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6">Ma'lumot topilmadi</td></tr>
            ) : paginated.map((s, i) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="py-2 px-3">{s.name}</td>
                <td className="py-2 px-3">{s.related_dic?.name} {s.related_dic?.type ? <i className="text-gray-400">({s.related_dic.type})</i> : ''}</td>
                <td className="py-2 px-3">{s.image ? <img src={s.image} alt="rasm" className="w-16 h-16 object-cover rounded" /> : ''}</td>
                <td className="py-2 px-3 flex gap-2">
                  <button onClick={() => openModal('edit', s)} className="px-2 py-1 bg-yellow-400 text-white rounded">Tahrirlash</button>
                  <button onClick={() => handleDelete(s._id)} className="px-2 py-1 bg-red-500 text-white rounded">O'chirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => handlePage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{modalMode === 'edit' ? "Bo'limni tahrirlash" : "Bo'lim qo'shish"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Bo'lim nomi</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Lug'atni tanlang</label>
                <select
                  name="related_dic"
                  value={form.related_dic}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Lug'atni tanlang</option>
                  {dictionaries.map(d => (
                    <option key={d._id} value={d._id}>{d.name} {d.type ? `(${d.type})` : ''}</option>
                  ))}
                </select>
              </div>
              {/* Image upload and preview */}
              <div>
                <label className="block mb-1 font-medium">Rasm yuklash</label>
                {form.imageUrl && (
                  <div className="mb-2">
                    <img src={form.imageUrl} alt="preview" className="w-24 h-24 object-cover rounded mb-1" />
                    <button type="button" onClick={handleRemoveImage} className="text-red-500 underline text-sm">Rasmni o'chirish</button>
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFormChange}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Yuklanmoqda...' : 'Saqlash'}</button>
                <button type="button" onClick={closeModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Section;
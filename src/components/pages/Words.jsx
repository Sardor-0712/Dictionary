import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

function Words() {
  const [words, setWords] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [dictionaryFilter, setDictionaryFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', desc: '', dictionary: '', section: '', category: '', image: null, imageUrl: '' });
  const [alert, setAlert] = useState({ show: false, msg: '', success: true });
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [detailWord, setDetailWord] = useState(null);

  // Fetch dictionaries
  const fetchDictionaries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/dictionary/get-all`);
      if (data.success) setDictionaries(data.data);
    } catch (e) {
      toast.error(e.response.data.message || "Lug'atlar olishda xatolik");
      console.error("Lug'atlar olishda xatolik:", e?.response?.data || e.message);
    };
  }
  // Fetch sections
  const fetchSections = async (dictionaryId = '', forSelect = false) => {
    let url = dictionaryId
      ? `${API_URL}/section/by-dictionary/${dictionaryId}`
      : `${API_URL}/section/get-all`;
    try {
      const { data } = await axios.get(url);
      if (data.success) setSections(data.data);
    } catch (e) {
      console.error("Bo'limlar olishda xatolik:", e?.response?.data || e.message);
      toast.error(e.response.data.message || "Bo'limlar olishda xatolik");
    }
  };

  // Fetch categories
  const fetchCategories = async (sectionId = '', forSelect = false) => {
    console.log("YUBORILAYOTGAN SECTION ID:", sectionId);

    if (!sectionId || sectionId === 'all') {
      setCategories([]);
      return;
    }

    const url = `${API_URL}/category/by-section/${sectionId}`;

    try {
      const { data } = await axios.get(url);
      if (data.success) setCategories(data.data);
    } catch (e) {
      console.error("Kategoriya olishda xatolik:", e?.response?.data || e.message);
      toast.error(e.response.data.message || "Kategoriya olishda xatolik");
    }
  };



  // Fetch words
  const fetchWords = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/words/get-all`);
      if (data.success) setWords(data.data);
    } catch (e) {
      console.error("So'zlar olishda xatolik:", e?.response?.data || e.message);
      toast.error(e.response.data.message || "So'zlar olishda xatolik");
     }
  };

  useEffect(() => {
    fetchDictionaries();
    fetchSections();
    fetchCategories();
    fetchWords();
  }, []);

  // Filtering and search
  const filtered = words.filter(w => {
    let ok = true;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) ok = false;
    if (dictionaryFilter !== 'all' && w.related_dic?._id !== dictionaryFilter) ok = false;
    if (sectionFilter !== 'all' && w.related_sec?._id !== sectionFilter) ok = false;
    if (categoryFilter !== 'all' && w.related_cat?._id !== categoryFilter) ok = false;
    return ok;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal open/close
  const openModal = (mode, word = null) => {
    setModalMode(mode);
    setShowModal(true);
    if (mode === 'edit' && word) {
      setEditing(word._id);
      setForm({
        name: word.name,
        desc: word.desc || '',
        dictionary: word.related_dic?._id || '',
        section: word.related_sec?._id || '',
        category: word.related_cat?._id || '',
        image: null,
        imageUrl: word.image || ''
      });
      fetchSections(word.related_dic?._id, true);
      fetchCategories(word.related_sec?._id, true);
    } else {
      setEditing(null);
      setForm({ name: '', desc: '', dictionary: '', section: '', category: '', image: null, imageUrl: '' });
    }
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', desc: '', dictionary: '', section: '', category: '', image: null, imageUrl: '' }); };

  // Form change
  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0], imageUrl: files[0] ? URL.createObjectURL(files[0]) : '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
      if (name === 'dictionary') {
        setForm(f => ({ ...f, section: '', category: '' }));
        setSections([]);
        setCategories([]);
        if (value) {
          fetchSections(value, true);
        }
      } else if (name === 'section') {
        setForm(f => ({ ...f, category: '' }));
        if (value && value !== 'all') {
          fetchCategories(value, true);
        } else {
          setCategories([]);
        }
      }
    }
  };

  // Add/Edit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    formData.append('name', form.name);
    formData.append('desc', form.desc);
    formData.append('related_dic', form.dictionary);
    formData.append('related_sec', form.section);
    formData.append('related_cat', form.category);


    if (form.image) formData.append('image', form.image);
    const url = editing
      ? `${API_URL}/words/update/${editing}`
      : `${API_URL}/words/add`;
    const method = editing ? 'put' : 'post';
    try {
      const { data } = await axios[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) {
        setAlert({ show: true, msg: editing ? 'Tahrirlandi!' : 'Qo‘shildi!', success: true });
        fetchWords();
        closeModal();
      } else {
        setAlert({ show: true, msg: data.message || 'Saqlanmadi.', success: false });
      }
    } catch (err) {
      setAlert({ show: true, msg: err.message, success: false });
    }
    setLoading(false);
    setTimeout(() => setAlert({ show: false, msg: '', success: true }), 3000);
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete?')) return;
    try {
      await axios.delete(`${API_URL}/words/delete/${id}`);
      setAlert({ show: true, msg: 'Deleted', success: true });
      fetchWords();
    } catch (err) {
      setAlert({ show: true, msg: err.message, success: false });
    }
    setTimeout(() => setAlert({ show: false, msg: '', success: true }), 3000);
  };

  // Remove image (in modal)
  const handleRemoveImage = () => {
    setForm(f => ({ ...f, image: null, imageUrl: '' }));
  };

  // Pagination
  const handlePage = p => setPage(p);

  // Detail modal
  const openDetail = word => { setDetailWord(word); setShowDetail(true); };
  const closeDetail = () => { setShowDetail(false); setDetailWord(null); };

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="flex items-center gap-4 mb-4">
        <select value={dictionaryFilter} onChange={e => { setDictionaryFilter(e.target.value); setPage(1); fetchSections(e.target.value); }} className="border px-3 py-2 rounded">
          <option value="all">Barcha lug'atlar</option>
          {dictionaries.map(d => (
            <option key={d._id} value={d._id}>{d.name} {d.type ? `(${d.type})` : ''}</option>
          ))}
        </select>
        <select value={sectionFilter} onChange={e => { setSectionFilter(e.target.value); setPage(1); fetchCategories(e.target.value); }} className="border px-3 py-2 rounded">
          <option value="all">Barcha bo'limlar</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="all">Barcha kategoriyalar</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="So'zlarni qidirish..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded flex-1"
        />
        <button onClick={() => openModal('add')} className="bg-black text-white px-4 py-2 rounded">+ So'z qo'shish</button>
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
              <th className="py-2 px-3 font-semibold text-gray-700">So'z</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Lug'at</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Bo'lim</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Kategoriya</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Rasm</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6">Ma'lumot topilmadi</td></tr>
            ) : paginated.map((w, i) => (
              <tr key={w._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="py-2 px-3">
                  <span className="text-blue-600 underline cursor-pointer" onClick={() => openDetail(w)}>{w.name}</span>
                </td>
                <td className="py-2 px-3">{w.related_dic?.name} {w.related_dic?.type ? <i className="text-gray-400">({w.related_dic.type})</i> : ''}</td>
                <td className="py-2 px-3">{w.related_sec?.name || ''}</td>
                <td className="py-2 px-3">{w.related_cat?.name || ''}</td>
                <td className="py-2 px-3">{w.image ? <img src={w.image} alt="rasm" className="w-12 h-12 object-cover rounded" /> : ''}</td>
                <td className="py-2 px-3 flex gap-2">
                  <button onClick={() => openModal('edit', w)} className="px-2 py-1 bg-yellow-400 text-white rounded">Tahrirlash</button>
                  <button onClick={() => handleDelete(w._id)} className="px-2 py-1 bg-red-500 text-white rounded">O'chirish</button>
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'edit' ? "So'zni tahrirlash" : "Yangi so'z qo'shish"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">So'z</label>
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
                <label className="block mb-1 font-medium">Tavsif</label>
                <textarea
                  name="desc"
                  value={form.desc}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={2}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Lug'atni tanlang</label>
                <select
                  name="dictionary"
                  value={form.dictionary}
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
              <div>
                <label className="block mb-1 font-medium">Bo'limni tanlang</label>
                <select
                  name="section"
                  value={form.section}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Bo'limni tanlang</option>
                  {sections.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Kategoriya tanlang</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="">Kategoriya tanlang</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
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

      {/* Detail Modal */}
      {showDetail && detailWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeDetail}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">So'z tafsilotlari</h2>
            <p><strong>So'z:</strong> {detailWord.name}</p>
            <p><strong>Tavsif:</strong> {detailWord.desc || '—'}</p>
            <p><strong>Lug'at:</strong> {detailWord.related_dic?.name} {detailWord.related_dic?.type ? <i className="text-gray-400">({detailWord.related_dic.type})</i> : ''}</p>
            <p><strong>Bo'lim:</strong> {detailWord.related_sec?.name || ''}</p>
            <p><strong>Kategoriya:</strong> {detailWord.related_cat?.name || ''}</p>
            <div><strong>Rasm:</strong><br />{detailWord.image ? <img src={detailWord.image} alt="img" className="w-32 h-32 object-cover rounded" /> : '—'}</div>
            <div className="flex justify-end mt-4">
              <button type="button" onClick={closeDetail} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Yopish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Words;
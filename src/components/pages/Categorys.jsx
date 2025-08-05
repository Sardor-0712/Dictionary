import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';

const PAGE_SIZE = 10;

function Categorys() {
  const [categories, setCategories] = useState([]);
  const [dictionaries, setDictionaries] = useState([]);
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [dictionaryFilter, setDictionaryFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState({ show: false, msg: '', success: true });

  // Modal form state
  const [form, setForm] = useState({ name: '', dictionary: '', section: '' });

  // Fetch dictionaries
  const fetchDictionaries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/dictionary/get-all`);
      if (data.success) setDictionaries(data.data);
    } catch (e) { }
  };

  // Fetch sections
  const fetchSections = async (dictionaryId = '', forSelect = false) => {
    let url = dictionaryId
      ? `${API_URL}/section/by-dictionary/${dictionaryId}`
      : `${API_URL}/section/get-all`;
    try {
      const { data } = await axios.get(url);
      if (data.success) setSections(data.data);
    } catch (e) { }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/category/get-all`);
      if (data.success) setCategories(data.data);
    } catch (e) { }
  };

  useEffect(() => {
    fetchDictionaries();
    fetchSections();
    fetchCategories();
  }, []);

  // Filtering and search
  const filtered = categories.filter(c => {
    let ok = true;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) ok = false;
    if (dictionaryFilter !== 'all' && c.related_dic?._id !== dictionaryFilter) ok = false;
    if (sectionFilter !== 'all' && c.related_sec?._id !== sectionFilter) ok = false;
    return ok;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Modal open/close
  const openModal = (mode, cat = null) => {
    setModalMode(mode);
    setShowModal(true);
    if (mode === 'edit' && cat) {
      setEditing(cat._id);
      setForm({
        name: cat.name,
        dictionary: cat.related_dic?._id || '',
        section: cat.related_sec?._id || ''
      });
      fetchSections(cat.related_dic?._id, true);
    } else {
      setEditing(null);
      setForm({ name: '', dictionary: '', section: '' });
      fetchSections();
    }
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({ name: '', dictionary: '', section: '' }); };

  // Form change
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'dictionary') {
      setForm(f => ({ ...f, section: '' }));
      fetchSections(value, true);
    }
  };

  // Add/Edit
  const handleSubmit = async e => {
    e.preventDefault();
    const body = {
      name: form.name,
      related_dic: form.dictionary,
      related_sec: form.section
    };
    const url = editing
      ? `${API_URL}/category/update/${editing}`
      : `${API_URL}/category/add`;
    const method = editing ? 'put' : 'post';
    try {
      const { data } = await axios[method](url, body);
      if (data.success) {
        setAlert({ show: true, msg: editing ? 'Updated!' : 'Added!', success: true });
        fetchCategories();
        closeModal();
      } else {
        setAlert({ show: true, msg: data.message || 'Failed', success: false });
      }
    } catch (err) {
      setAlert({ show: true, msg: err.message, success: false });
    }
    setTimeout(() => setAlert({ show: false, msg: '', success: true }), 3000);
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const { data } = await axios.delete(`${API_URL}/category/delete/${id}`);
      setAlert({ show: true, msg: data.message, success: data.success });
      fetchCategories();
    } catch (err) {
      setAlert({ show: true, msg: err.message, success: false });
    }
    setTimeout(() => setAlert({ show: false, msg: '', success: true }), 3000);
  };

  // Pagination
  const handlePage = p => setPage(p);

  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="flex items-center gap-4 mb-4">
        <select value={dictionaryFilter} onChange={e => { setDictionaryFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="all">Barcha lug'atlar</option>
          {dictionaries.map(d => (
            <option key={d._id} value={d._id}>{d.name} {d.type ? `(${d.type})` : ''}</option>
          ))}
        </select>
        <select value={sectionFilter} onChange={e => { setSectionFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="all">Barcha bo'limlar</option>
          {sections.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Kategoriyalarni qidirish..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="border px-3 py-2 rounded flex-1"
        />
        <button onClick={() => openModal('add')} className="bg-black text-white px-4 py-2 rounded">+ Kategoriya qo'shish</button>
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
              <th className="py-2 px-3 font-semibold text-gray-700">Bo'lim</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Lug'at</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6">Ma'lumot topilmadi</td></tr>
            ) : paginated.map((c, i) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="py-2 px-3">{c.name}</td>
                <td className="py-2 px-3">{c.related_sec?.name || ''}</td>
                <td className="py-2 px-3">{c.related_dic?.name} {c.related_dic?.type ? <i className="text-gray-400">({c.related_dic.type})</i> : ''}</td>
                <td className="py-2 px-3 flex gap-2">
                  <button onClick={() => openModal('edit', c)} className="px-2 py-1 bg-yellow-400 text-white rounded">Tahrirlash</button>
                  <button onClick={() => handleDelete(c._id)} className="px-2 py-1 bg-red-500 text-white rounded">O'chirish</button>
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'edit' ? 'Kategoriyani tahrirlash' : "+ Kategoriya qo'shish"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Kategoriya nomi</label>
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
              <div className="flex justify-end gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Saqlash</button>
                <button type="button" onClick={closeModal} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorys;
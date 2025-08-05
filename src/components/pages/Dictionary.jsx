import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-toastify';



const PAGE_SIZE = 10;

const Dictionary = () => {
  const [data, setData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch dictionaries
  const fetchDictionaries = async (pageNum = 1, searchVal = search, filterVal = filter) => {
    setLoading(true);
    let url = `${API_URL}/dictionary/get-all?page=${pageNum}&limit=${PAGE_SIZE}`;
    if (filterVal !== "all") url += `&type=${filterVal}`;
    if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;
    try {
      const { data } = await axios.get(url);
      if (data.success) {
        setData(data.data);
        setTotal(data.pagination?.totalCount || 0);
        setPage(pageNum);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.msg || "Server error");
    }
    setLoading(false);
  };

  // Add
  const addDictionary = async (formData) => {
    try {
      const { data } = await axios.post(
        API_URL + "/dictionary/add",
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (data.success) {
        toast.success("Dictionary qo'shildi");
        await fetchDictionaries(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.msg || "Serverda xatolik");
    }
  };

  // Edit
  const updateDictionary = async (id, formData) => {
    try {
      const { data } = await axios.put(API_URL + "/dictionary/update/" + id, formData);
      if (data.success) {
        toast.success("Dictionary updated successfully");
        fetchDictionaries(page);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.msg || "Server error");
    }
    setShowEditModal(false);
    setEditItem(null);
  };

  // Delete
  const deleteDictionary = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dictionary?")) return;
    try {
      const { data } = await axios.delete(API_URL + "/dictionary/delete/" + id);
      if (data.success) {
        toast.success("Dictionary deleted successfully");
        fetchDictionaries(page);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.msg || "Server error");
    }
  };

  // Modal open/close helpers
  const openEditModal = (item) => {
    setEditItem(item);
    setShowEditModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    fetchDictionaries(1);
    // eslint-disable-next-line
  }, []);

  // Search & filter
  useEffect(() => {
    fetchDictionaries(1, search, filter);
    // eslint-disable-next-line
  }, [search, filter]);

  return (
    <div className="w-full min-h-screen bg-white p-8">
      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">Barchasi</option>
          <option value="tarixiy">Tarixiy</option>
          <option value="zamonaviy">Zamonaviy</option>
        </select>
        <button
          className="ml-auto px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          onClick={() => setShowAddModal(true)}
        >
          + Yangi qo'shish
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 font-semibold text-gray-700">T/R</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Nomi</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Turi</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Izoh</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Rasm</th>
              <th className="py-2 px-3 font-semibold text-gray-700">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6">Yuklanmoqda...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6">Ma'lumot topilmadi</td></tr>
            ) : data.map((row, idx) => (
              <tr key={row._id || idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="py-2 px-3">{row.name}</td>
                <td className="py-2 px-3">{row.type || '-'}</td>
                <td className="py-2 px-3">{row.desc || '-'}</td>
                <td className="py-2 px-3 text-gray-500">{row.image ? <img src={row.image} alt="rasm" className="w-12 h-12 object-cover rounded" /> : "Rasm mavjud emas"}</td>
                <td className="py-2 px-3 flex gap-2">
                  <button onClick={() => openEditModal(row)} className="px-2 py-1 bg-yellow-400 text-white rounded">Tahrirlash</button>
                  <button onClick={() => deleteDictionary(row._id)} className="px-2 py-1 bg-red-500 text-white rounded">O'chirish</button>
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
            onClick={() => fetchDictionaries(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Yangi lug'at qo'shish" onClose={() => setShowAddModal(false)}>
          <DictionaryForm onSubmit={async (formData) => {
            await addDictionary(formData);
            setShowAddModal(false);
          }} />
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <Modal title="Lug'atni tahrirlash" onClose={() => { setShowEditModal(false); setEditItem(null); }}>
          <DictionaryForm
            initial={editItem}
            onSubmit={async (formData) => {
              await updateDictionary(editItem._id, formData);
              setShowEditModal(false);
              setEditItem(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Modal component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// Form component (add/edit)
function DictionaryForm({ onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "tarixiy");
  const [desc, setDesc] = useState(initial?.desc || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("Iltimos, nom maydonini to'ldiring.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("type", type);
    formData.append("desc", desc);
    if (image) formData.append("image", image);
    await onSubmit(formData);
    setLoading(false);
    setName("");
    setType("tarixiy");
    setDesc("");
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Nomi</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Turi</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="tarixiy">Tarixiy</option>
          <option value="zamonaviy">Zamonaviy</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Izoh</label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={2}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Rasm (ixtiyoriy)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
          className="w-full"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
        disabled={loading}
      >
        {loading ? "Yuklanmoqda..." : (initial ? "Saqlash" : "Qo'shish")}
      </button>
    </form>
  );
}

export default Dictionary;
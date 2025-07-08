import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { API_URL } from './config'
import { toast } from 'react-toastify'
import { Link } from "react-router-dom"

const News = () => {

    const [news, setNews] = useState([]);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState("");



    const getAllNews = async () => {
        try {
            const { data } = await axios.get(API_URL + "/news/get-all");
            if (data.success) {
                setNews(data.data);
            }
        }
        catch (error) {
            toast.error(error.response.data.message || error.response.data.msg);
        }
    }

    const addNews = async () => {
        try {
            const { data } = await axios.post(API_URL + "/news/add", { title, desc });
            if (data.success) {
                toast.success(data.msg);
                setOpen(false);
                setTitle("");
                setDesc("");
                getAllNews(); // Yangilik qo'shilgandan so'ng yangilash
            }
        } catch (error) {
            toast.error(error.response.data.message || error.response.data.msg);
        }
    }

    const deleteNews = async (id) => {
        try {
            const { data } = await axios.delete(API_URL + "/news/delete/" + id);
            if (data.success) {
                toast.success(data.msg);
                getAllNews();
            }
        } catch (error) {
            toast.error(error.response.data.message || error.response.data.msg);
        }
    }

    const startEdit = (item) => {
        setEditMode(true);
        setEditId(item._id);
        setTitle(item.title);
        setDesc(item.desc);
        setOpen(true);
    };

    const updateNews = async () => {
        try {
            const { data } = await axios.put(API_URL + "/news/update/" + editId, { title, desc });
            if (data.success) {
                toast.success(data.msg);
                setEditMode(false);
                setEditId("");
                setOpen(false);
                setTitle("");
                setDesc("");
                getAllNews();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data?.msg);
        }
    };

    useEffect(() => {
        getAllNews();
    }, []);

    return (
        <>
            <h1 className="text-3xl font-bold text-center my-6 text-blue-700"> News </h1>
            <div className="flex justify-center mb-6">
                <button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow">Add News</button>
            </div>
            {open && (
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
                    <input
                        type="text"
                        placeholder="Sarlavha"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-1.1 focus:ring-blue-400"
                    />
                    <textarea
                        placeholder="Tavsif"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-1.1 focus:ring-blue-400"
                    />
                    <div className="flex gap-2">
                        {editMode ? (
                            <button onClick={updateNews} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded">Edit</button>
                        ) : (
                            <button onClick={addNews} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">Add</button>
                        )}
                        <button onClick={() => { setOpen(false); setEditMode(false); setEditId(""); setTitle(""); setDesc(""); }} className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded">Bekor qilish</button>
                    </div>
                </div>
            )}
            {
                news.length > 0 ? (
                    <div className="max-w-2xl mx-auto">
                        <table className='border-1 w-full bg-white shadow-md'>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2">#</th>
                                    <th className="px-4 py-2">Title</th>
                                    <th className="px-4 py-2">Description</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {news.map((item, idx) => (
                                    <tr key={idx} className="border hover:bg-gray-50">
                                        <td className="px-4 py-2">{idx + 1}</td>
                                        <td className="px-4 py-2 border">{item.title}</td>
                                        <td className="px-4 py-2 border">{item.desc}</td>
                                        <td>
                                            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-1 rounded m-1" onClick={() => deleteNews(item._id)}>Delete</button>
                                            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-1 rounded m-1" onClick={() => startEdit(item)}>Edit </button>
                                            <Link to={`/news/${item._id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-1 rounded ">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Loading......</p>
                )
            }
        </>
    )
}

export default News

// 7:37
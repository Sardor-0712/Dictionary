import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from './config'
import { toast } from 'react-toastify';

function NewsOne() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [news, setNews] = useState({});


    const getNewsById = async (id) => {
        try {
            const { data } = await axios.get(`${API_URL}/news/get/${id}`);
            if (data.success) {
                setNews(data.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.msg);
            navigate("/news");
        }
    }

    useEffect(() => {
        getNewsById(id);

    }, [id]);

    return (
        <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
            <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-4 text-blue-700">{news?.title}</h2>
                <p className="text-gray-700 text-lg mb-6">{news?.desc}</p>
                <button
                    onClick={() => navigate("/news")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow"
                >
                    Back to News
                </button>
            </div>
        </div>
    )
}

export default NewsOne
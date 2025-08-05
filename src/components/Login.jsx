import React, { useState } from 'react'
import Dictionary_app from './Dictionary_app';


function Login() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [country, setCountry] = useState("uz");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (phone === "" || password === "") {
            setError("Iltimos, barcha maydonlarni to'ldiring");
        } else if (phone === "919690712" && password === "7272") {
            setError("");
            setPassword("");
            setPhone("");
            setIsLoggedIn(true);
        } else {
            setError("Telefon raqam yoki parol noto'g'ri");
        }
    };

    if (isLoggedIn) {
        return <Dictionary_app />;
    }

    return (
        <div className="max-w-[350px] mx-auto mt-16 p-6 border border-gray-200 rounded-lg shadow-md bg-white">
            <h2 className="text-2xl font-bold text-center mb-6">Kirish</h2>
            <h3 className="text-left font-normal text-[14px] mb-4">Tizimga kirish uchun login va parol ni kiriting</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-gray-700 font-medium">Login </label>
                    <div className="flex items-center gap-2">
                        <select
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            className="px-2 py-2 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-[13px]"
                            style={{ minWidth: 60 }}
                        >
                            <option value="uz">🇺🇿 +998</option>
                            <option value="ru">🇷🇺 +7</option>
                            <option value="us">🇺🇸 +1</option>
                        </select>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => {
                                // Faqat raqamlarni qoldirish
                                const onlyNums = e.target.value.replace(/\D/g, "");
                                setPhone(onlyNums);
                            }}
                            placeholder="901234567"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength={12}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4 text-left">
                    <label className="block mb-1 text-gray-700 font-medium">Parol</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Parol"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>
                {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors duration-200">
                    Kirish
                </button>
            </form>
        </div>
    );
}

export default Login
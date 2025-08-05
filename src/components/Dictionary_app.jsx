import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dictionary from './pages/Dictionary';
import Section from './pages/Section';
import Categorys from './pages/Categorys';
import Words from './pages/Words';


function Dictionary_app() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen h-screen w-screen bg-gray-50 overflow-hidden ">
      <aside className="w-1/6 bg-gray-200 flex flex-col items-center py-6 h-full">
        <img src="/images/logo.png" alt="logo" className="w-24 h-24 mb-6 rounded-full border" />
        <nav className="w-full">
          <ul className="space-y-2">
            <li>
              <Link to="/dictionary" className="block px-6 py-2 rounded focus:bg-gray-100 font-semibold text-gray-900">Lug'at</Link>
            </li>
            <li>
              <Link to="/section" className="block px-6 py-2 rounded text-gray-700 focus:bg-gray-100">Bo'limlar</Link>
            </li>
            <li>
              <Link to="/category" className="block px-6 py-2 rounded text-gray-700 focus:bg-gray-100">Kategoriyalar</Link>
            </li>
            <li>
              <Link to="/words" className="block px-6 py-2 rounded text-gray-700 focus:bg-gray-100">So'zlar</Link>
            </li>
            <li className="text-red-600">
              <button onClick={() => setIsLoggedIn(false)} className="mt-auto px-6 py-2 text-red-500 hover:underline w-full ">Chiqish</button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <Routes>
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/section" element={<Section />} />
          <Route path="/category" element={<Categorys />} />
          <Route path="/words" element={<Words />} />
          <Route path="*" element={<Dictionary />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dictionary_app;
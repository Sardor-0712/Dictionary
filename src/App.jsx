import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import News from "./components/News";
import NewsOne from "./components/NewsOne";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsOne />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App

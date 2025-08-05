import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Dictionary_app from "./components/Dictionary_app";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Dictionary_app />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

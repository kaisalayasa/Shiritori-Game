import Card from "./components/Card"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
function App() {


  return (
    <>
      <Navbar/>
      <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage/>}></Route>
            </Routes>
     
    </BrowserRouter>
    </>
  )
}

export default App

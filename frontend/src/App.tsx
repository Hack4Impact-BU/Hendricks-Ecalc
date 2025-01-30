import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
import Welcome from './pages/welcome.tsx'
import Navbar from './components/navbar.tsx'
function App() {

  return (
    
    <BrowserRouter>
      <Navbar />
    
      <Routes>
        {/* <Route exact path="/" element={Home} /> */}
        <Route path="/about" element={<h1>Work in Progress</h1>} />
        <Route path="/contact" element={<h1>Work in Progress</h1>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/welcome" element={<Welcome/>} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App

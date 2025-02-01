import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
import Welcome from './pages/welcome.tsx'
import Navbar from './components/navbar.tsx'
import OcrUpload from './pages/ocrTest.tsx'

import ForgotPassword from './pages/forgotPassword.tsx'
import ResetPassword from './pages/resetPassword.tsx'
import DeviceInfoSubmission from './pages/deviceInfoSubmission.tsx'
import SerialNumInput from './pages/serialNumInput.tsx'

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
        <Route path="/ocr" element={<OcrUpload/>} />
        <Route path="/welcome" element={<Welcome/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />
        <Route path="/device-info-submission" element={<DeviceInfoSubmission/>} />
        <Route path="/serialNumInput" element={<SerialNumInput/>} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App

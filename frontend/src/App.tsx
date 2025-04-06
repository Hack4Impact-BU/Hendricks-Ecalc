import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.tsx'
import Register from './pages/register.tsx'
import Welcome from './pages/welcome.tsx'
import Navbar from './components/navbar.tsx'
import ForgotPassword from './pages/forgotPassword.tsx'
import ResetPassword from './pages/resetPassword.tsx'
import DeviceInfoSubmission from './pages/deviceInfoSubmission.tsx'
import SerialNumInput from './pages/serialNumInput.tsx'
import AdminPage from './pages/adminPage.tsx'
import Profile from './pages/profile.tsx'
import PlaceholderResults from './pages/placeholderResults.tsx'
import AboutUs from './pages/aboutUs.tsx'
import ResultsPage from './pages/resultsPage.tsx'
import Contact from './pages/contact.tsx'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* <Route exact path="/" element={Home} /> */}
        <Route path="/about" element={<AboutUs/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/device-info-submission"
          element={<DeviceInfoSubmission />}
        />
        <Route path="/serialNumInput" element={<SerialNumInput />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage/>} />
        <Route path="/results" element={<ResultsPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

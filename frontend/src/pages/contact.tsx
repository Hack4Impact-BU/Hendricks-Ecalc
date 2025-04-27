import { SyntheticEvent, useState } from "react";
import { Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import axios from "axios";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const sendEmail = async (e:SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${apiBase}/api/users/send-contact`, {
        name,
        email,
        subject,
        message
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setLoading(false);
      alert("Email has been sent!")
    } catch (error) {
      alert("An error occurred sending the email. Please try again.");
      setLoading(false);
    }
  }

  return(

    <div className="flex flex-row flex-wrap justify-start items-center px-4 py-8 md:px-10 md:py-10">
      
      {/* Left side – Contact Info box */}
      <div className="flex flex-col flex-wrap justify-start items-stretch z-1 lg:mr-[-280px] bg-black text-white px-8 py-16 rounded-2xl shadow-lg w-full mx-auto lg:w-[30%]">
        
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-center">Contact Us</h2>

        {/* Email */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Mail className="h-[30px] w-[30px]"/>
            <p className="text-2xl font-semibold ml-2">Email</p>
          </div>
          <a href="mailto:info@hendricks-foundation.org" className="text-yellow-300 underline">
            info@hendricks-foundation.org
          </a>
        </div>

        {/* Socials */}
        <div>
          <div className="flex items-center mb-2">
            <MapPin className="h-[30px] w-[30px]" />
            <p className="text-2xl font-semibold ml-2">Socials</p>
          </div>
          <div className="flex space-x-4 text-2xl">
            <a href="https://www.facebook.com/hendricksfound" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-6 h-6 hover:text-yellow-300 transition" />
            </a>
            <a href="https://twitter.com/hendricksfound" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-6 h-6 hover:text-yellow-300 transition" />
            </a>
            <a href="https://www.linkedin.com/company/hendricks-foundation/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-6 h-6 hover:text-yellow-300 transition" />
            </a>
            <a href="https://www.instagram.com/hendricksfoundation/" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-6 h-6 hover:text-yellow-300 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Form container */}
      <div className="w-full mx-auto mt-[24px] lg:mt-0 lg:max-w-[700px] bg-white/50 backdrop-blur-md p-6 lg:pl-[200px] lg:pr-[150px] lg:py-16 rounded-2xl shadow-md">
        
        {/* Title for the form */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.25)' }}>Message Us</h1>
          <p className="mb-6 font-normal">Fill out the form below!</p>
        </div>
        
        {/* Start of form */}
        <form className="flex flex-col gap-5" onSubmit={sendEmail}>

        {/* Name */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}            
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Subject */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Subject:</label>
          <input
            type="text"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}            
            required
            className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <label className="text-black font-bitter font-medium text-lg mb-1">Message:</label>
          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}            
            required
            className="h-24 rounded-xl border-2 border-[#2E7D32] pt-2 px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
          />
        </div>

        {/* Button */}
        <div className="flex flex-col justify-center items-center mt-3">
          <button
            className="w-full bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full transition duration-200 cursor-pointer hover:brightness-105"
            type="submit"
          >
            {loading ? "Sending..." : "Send"}  
          </button>
        </div>
      </form>
    </div>
  </div>
  )
}

export default Contact
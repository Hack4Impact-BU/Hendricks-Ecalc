import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase.ts'
import { AuthResponse } from "@supabase/supabase-js";
import Laptop from '../assets/laptop.png'
import { Turnstile } from '@marsidev/react-turnstile'

import { User } from '@supabase/supabase-js'
import { Profile } from '../utils/types'

function Register() {
  const [email, setEmail] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [captchaKey, setCaptchaKey] = useState(0);

  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const navigate = useNavigate() //used to redirect to different page

  const frontendURL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  //checking for existing user session
  useEffect(() => {
    console.log(import.meta.env.VITE_FRONTEND_URL)
    async function checkUser(user: User) {
      const { data: rawData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

      if (userError || !rawData) {
          console.error("Profile lookup failed", userError);
          navigate("/login");
          return;
      }
      
      const userData = rawData as Profile;
      if (userData.two_fa_verified === false) {
          navigate("/login");
      }
    }
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        checkUser(session.user);
      }
    });

    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

  //register user
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!captchaToken) {
      setCaptchaError('Please complete the captcha');
      return;
    }
    setCaptchaError(null);

    const { data, error }: AuthResponse = await supabase.auth.signUp({ //call signup function from supabase
      email,
      password,
      options: {
        emailRedirectTo: `${frontendURL}`, //temporary welcome link
        data: { company: company.trim() }, // Send company info in metadata
        captchaToken
      },
    })

    //Reset the token after submission
    setCaptchaToken(null);

    //error handling
    if (error) {
      console.error('Error signing up:', error.message)
      alert(error.message)
      setCaptchaKey((prev) => prev + 1); // Trigger re-render Turnstile component
      return
    } else if (data.user?.identities?.length === 0) {
      console.error('User already Exists')
      alert('User already Exists')
      setCaptchaKey((prev) => prev + 1);
      return
    }

    //success message
    console.log('Account Created: ', data.user)
    alert('Signup successful! Check your email for confirmation.');
  }

  return (
    <>
      <div className='flex items-center justify-evenly px-4 py-8 md:px-10 md:py-10'>

        {/* Left - Laptop Image */}
        <div className='w-1/2 hidden lg:flex justify-center'>
          <img src={Laptop} alt="laptop" className="w-full h-auto" />
        </div>

        <div className="w-full max-w-xl flex flex-col items-center  mt-5 sm:px-5 md:px-6">

          {/* Title Section */}
          <div className="mb-4 text-center">
            <h1 className="text-white text-2xl sm:text-5xl font-bold font-bitter leading-tight tracking-widest capitalize drop-shadow-md">
              Register
            </h1>
            <h2 className="text-white text-sm sm:text-xl font-medium font-bitter mt-1">
              Fill in the fields below
            </h2>
          </div>


          {/* Registration Form */}
          <div className="w-full bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Form fields */}

              {/* EMAIL */}
              <div className="flex flex-col">
                <label className="text-black font-bitter font-medium text-lg mb-1">Email:</label>
                <input
                  type="text"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                />
              </div>

              {/* COMPANY */}
              <div className="flex flex-col">
                <label className="text-black font-bitter font-medium text-lg mb-1">Company:</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                />
              </div>

              {/* PASSWORD */}
              <div className="flex flex-col">
                <label className="text-black font-bitter font-medium text-lg mb-1">Password:</label>
                <input
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-2 border-[#2E7D32] px-4 placeholder-[#A8D5BA] bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D5BA] focus:border-[#2E7D32] transition duration-200"
                />
              </div>

              <div className='flex justify-center items-center'>
                <Turnstile
                  key={captchaKey}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => { setCaptchaToken(token) }} 
                  className='scale-[80%]  sm:scale-100'
                />

                {captchaError && <p style={{ color: 'red', fontSize: '0.75rem' }}>{captchaError}</p>}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex flex-col justify-center gap-2 items-center mt-3">
                <button
                  className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 cursor-pointer hover:brightness-105"
                  type="submit">Sign Up</button>
              </div>

              {/* LOGIN LINK */}
              <div className="mt-3 text-center text-sm text-gray-700">
                <p>Already have an account? {" "}
                  <Link to="/login" className='text-[#95C6A9] hover:underline'>
                    Login here
                  </Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
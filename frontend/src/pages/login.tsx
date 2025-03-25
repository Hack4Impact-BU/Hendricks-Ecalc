import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import supabase from '../utils/supabase.ts'
import { AuthResponse } from '@supabase/supabase-js'
import Laptop from '../assets/laptop.png'

function Login() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const navigate = useNavigate()

  //checking for existing user session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        navigate("/welcome");
      }
    });

    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

  //login user
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({ //call signin function from supabase
      email,
      password,
    })

    // error handling
    if (error) {
      alert(error.message)
      return
    }

    // success message
    console.log('logged in: ', data.user)
    navigate('/welcome')
  }

  return (
    <>
      <div className='flex items-center justify-evenly px-8'>

        {/* Left - Laptop Image */}
        <div className='w-1/2 flex justify-center'>
          <img src={Laptop} alt="laptop" className="w-full h-auto" />
        </div>

        {/* Right - Login Form */}
        <div className="w-full max-w-xl flex flex-col items-center  mt-5 px-4 sm:px-5 md:px-6">

          {/* Title Section */}
          <div className="mb-4 text-center">
            <h1 className="text-white text-2xl sm:text-5xl font-bold font-bitter leading-tight tracking-widest capitalize drop-shadow-md">
              Information
            </h1>
            <h2 className="text-white text-sm sm:text-xl font-medium font-bitter mt-1">
              Fill in the fields below
            </h2>
          </div>

          {/* Login form */}
          <div className="w-full bg-white/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

              {/* Buttons */}
              <div className="flex flex-col justify-center gap-2 items-center mt-3">
                <button
                  className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 cursor-pointer hover:brightness-105"
                  type="submit">Login</button>
                <button
                  className="bg-[#FFE017] shadow-md text-white font-bold text-lg py-2 px-10 rounded-full w-3/4 transition duration-200 cursor-pointer hover:brightness-105"
                  type="button">Skip</button>
              </div>

              {/* Link to register page */}
              <div className="mt-3 text-center text-sm text-gray-700">
                <p className="mb-1">
                  Don’t have an account?{" "}
                  <Link to="/register" className="text-[#95C6A9] hover:underline">
                    Create one now.
                  </Link>
                </p>
                <p>
                  Forgot your password?{" "}
                  <Link to="/forgot-password" className="text-[#95C6A9] hover:underline">
                    Reset it here.
                  </Link>
                </p>
              </div>

            </form>

          </div>
        </div>
      </div>
    </>
  )
}

export default Login
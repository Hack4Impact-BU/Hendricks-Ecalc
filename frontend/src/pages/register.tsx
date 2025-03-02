import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase.ts'
import { AuthResponse } from "@supabase/supabase-js";
import HCaptcha from '@hcaptcha/react-hcaptcha'


function Register() {
  const [email, setEmail] = useState<string>('')
  const [company, setCompany] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null); //a ref to use on our HCaptcha component
  const [captchaError, setCaptchaError] = useState<string|null>(null);

  const navigate = useNavigate() //used to redirect to different page

  //checking for existing user session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        navigate("/welcome"); //redirect to welcome page if user is already logged in
      }
    });

    return () => authListener.subscription.unsubscribe(); //clean up
  }, [navigate]);

  //register user
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if(!captchaToken) {
      setCaptchaError('Please complete the captcha');
      return;
    }

    const { data, error }: AuthResponse = await supabase.auth.signUp({ //call signup function from supabase
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173/welcome', //temporary welcome link
        data: { company: company.trim() }, // Send company info in metadata
        captchaToken
      },
    })

    //Reset the token after submission
    setCaptchaToken(null);
    // Reset the captcha on failed login
    captchaRef.current?.resetCaptcha();

    //error handling
    if (error) {
      console.error('Error signing up:', error.message)
      alert(error.message)
      return
    } else if (data.user?.identities?.length === 0) {
      console.error('User already Exists')
      alert('User already Exists')
      return
    }

    //success message
    console.log('Account Created: ', data.user)
    alert('Signup successful! Check your email for confirmation.');
  }

  return (
    <>
      <div className='flex flex-row justify-evenly items-center'>
        <div>
          <img src="../assets/react.svg" alt="Hendricks Foundation" />
        </div>
        <div className="flex flex-col items-center">
          <h1>Register</h1>
          <h2>Fill in the fields below</h2>
          <div className="p-10 border border-gray-300 rounded-md bg-opacity-10 bg-gray-100">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Form fields */}
              <div>
                <label className="flex">Email:</label>
                <input
                  type="text"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                />
              </div>
              <div>
                <label className="flex">Company:</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                />
              </div>
              <div>
                <label className="flex">Password:</label>
                <input
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                />
              </div>
              <div className='text-red-300'>
              <HCaptcha
                  ref={captchaRef}
                  sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                  onVerify={setCaptchaToken}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaError('Captcha error')} />
                {captchaError && <p style={{ color: 'red', fontSize: '0.75rem' }}>{captchaError}</p>}
              </div>
              <div className="flex flex-col justify-center gap-2 items-center">
                <button className="border p-1 w-1/2 items-center rounded-md bg-green-300 cursor-pointer hover:bg-green-200 active:bg-green-600" type="submit">Sign Up</button>
              </div>
              <div>
                <p>Already have an account? <Link to="/login" className='no-underline hover:underline  text-blue-500'>Login here</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
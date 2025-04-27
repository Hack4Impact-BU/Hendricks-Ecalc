import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase'
import { useEffect, useState } from 'react';
import HendricksLogo from '../assets/hendricksLogo.png'

import { Profile } from '../utils/types';
import { useLocation } from 'react-router-dom';

import { Menu, X } from 'lucide-react';

function Navbar() {
    const location = useLocation();

    const [user, setUser] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const navigate = useNavigate()

    const [isOpen, setOpen] = useState(false);

    // Check for existing user session
    useEffect(() => {
        async function checkUser() {
            const { data, error } = await supabase.auth.getUser();
            
            const sessionUser = data?.user;

            if (error || !sessionUser) {
                setUser(null);
                setIsAdmin(false);
                return;
            }

            const { data: rawData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

            if (userError || !rawData) {
                setUser(null);
                setIsAdmin(false);
                return;
            }

            const userData = rawData as Profile;

            if (!userData.two_fa_verified) {
                setUser(null);
                setIsAdmin(false);
                return;
            }

            setUser(sessionUser);
            setIsAdmin(sessionUser.email?.endsWith('@gmail.com') || false);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (session?.user) {
                checkUser();
            } else {
                setUser(null);
                setIsAdmin(false);
            }
        });

        //Cleans up the listener when the component unmounts.
        return () => {
            authListener.subscription.unsubscribe();
        }
    }, [location.pathname]);

    // Resizing 
    useEffect( () => {
        function handleResize() {
            if (window.innerWidth >= 1020){
                setOpen(false);
            }
        }

        handleResize();

        window.addEventListener('resize', handleResize);
        
        //Cleans up the listener when the component unmounts.
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    // handle signout button
    const handleClick = async () => {
        const { error: updateError } = await supabase
        .from("profiles")
        .update({ two_fa_verified: false })
        .eq("id", user.id);
    
        if (updateError) {
            console.error("Error updating profile for 2FA:", updateError);
            return;
        }
        
        const { error } = await supabase.auth.signOut()
        
        if (error) { // Error handling
            console.error('Error logging out:', error.message)
            return
        }

        setUser(null);
        navigate('/login')
    }
    return (
        // z-50 is to ensure navbar stays above all other content
        <nav className={`z-50 px-10 py-4 m-4 bg-white shadow-md ${isOpen ? "rounded-4xl" : "rounded-full"}` }>
            <div className='hidden relative lg:flex justify-between items-center'>
                <div className="flex items-center">
                    <img src={HendricksLogo} alt="Hendricks Foundation Logo" className="w-10 h-10 rounded-full mr-4" />
                    <Link to="/" className='text-sm sm:text-lg no-underline'>HENDRICKS FOUNDATION</Link>
                </div>
                <div className="flex gap-2 sm:gap-10 text-black font-bitter text-sm sm:text-lg">
                    <Link to="/" className='no-underline hover:underline'>Home</Link>
                    <Link to="/about" className='no-underline hover:underline'>About Us</Link>
                    <Link to="/contact" className='no-underline hover:underline'>Contact</Link>
                    {!user ? (
                        <>
                            <Link to="/login" className="no-underline hover:underline">Login</Link>
                            <Link to="/register" className="no-underline hover:underline">Register</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/device-info-submission" className="no-underline hover:underline">Devices</Link>
                            <Link to="/profile" className="no-underline hover:underline">Profile</Link>
                            {isAdmin ? <Link to="/admin" className="no-underline hover:underline">Admin</Link> : null}
                            <button onClick={handleClick} className='text-sm bg-[#FFE017] px-4 py-1 rounded-md text-white transition duration-200 cursor-pointer hover:brightness-105'>Sign Out</button>
                        </>
                    )}
                </div>
            </div>

            <div className='flex lg:hidden relative justify-between items-center'>
                <div className="flex items-center">
                    <img src={HendricksLogo} alt="Hendricks Foundation Logo" className="w-10 h-10 rounded-full mr-4" />
                    <Link to="/" className='text-sm sm:text-lg no-underline'>HENDRICKS FOUNDATION</Link>
                </div>
                {isOpen ? <X className='block lg:hidden h-[30px] w-[30px]' onClick={() => setOpen(!isOpen)}/> : <Menu className='block lg:hidden h-[30px] w-[30px]' onClick={() => setOpen(!isOpen)}/>}
            </div>

            {isOpen && 
            <>
                <div className="flex flex-col justify-center items-center mt-4 gap-4 sm:gap-10 text-black font-bitter text-sm sm:text-lg">
                    <Link to="/" className='no-underline hover:underline'>Home</Link>
                    <Link to="/about" className='no-underline hover:underline'>About Us</Link>
                    <Link to="/contact" className='no-underline hover:underline'>Contact</Link>
                    {!user ? (
                        <>
                            <Link to="/login" className="no-underline hover:underline">Login</Link>
                            <Link to="/register" className="no-underline hover:underline">Register</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/device-info-submission" className="no-underline hover:underline">Devices</Link>
                            <Link to="/profile" className="no-underline hover:underline">Profile</Link>
                            {isAdmin ? <Link to="/admin" className="no-underline hover:underline">Admin</Link> : null}
                            <button onClick={handleClick} className='bg-[#FFE017] px-4 py-2 rounded-md text-white transition duration-200 cursor-pointer hover:brightness-105'>Sign Out</button>
                        </>
                    )}
                </div>
            </>
            }
            
            
        </nav>
    )
}

export default Navbar
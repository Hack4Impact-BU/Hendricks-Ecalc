import { Link, useNavigate } from 'react-router-dom'
import supabase from '../utils/supabase'
import { useEffect, useState } from 'react';

function Navbar() {

    const [user, setUser] = useState<any>(null)
    const[isAdmin, setIsAdmin] = useState(false)
    const navigate = useNavigate()

    // Check for existing user session
    useEffect(() => {
        
        async function checkUser() {
            const { data, error } = await supabase.auth.getUser();
            if (!error) {
                setUser(data?.user || null);
            }
            
            // Check if the user is an admin based on their email domain
            setIsAdmin(data?.user?.email?.endsWith('@gmail.com') || false);
        }

        checkUser();

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user || null);
            setIsAdmin(session?.user?.email?.endsWith('@gmail.com') || false);
        });

        //Cleans up the listener when the component unmounts.
        return () => authListener.subscription.unsubscribe();
    }, []);

    // handle signout button
    const handleClick = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) { // Error handling
            console.error('Error logging out:', error.message)
            return
        }
        setUser(null);
        navigate('/login')
    }
    return (
        <nav className="flex justify-between items-center flex-row rounded-lg border border-gray-300 bg-white p-4 m-4">
                <div className="flex items-center">
                    <Link to="/" className='text-lg'>Hendricks Foundation</Link>
                </div>
                <div className="flex flex-row gap-4 items-center">
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
                        <button onClick={handleClick} className="border p-1 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600">Sign Out</button>
                    </>
                    )}
                    
                </div>
        </nav>
    )  
}

export default Navbar
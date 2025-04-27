import { Link, useNavigate } from 'react-router-dom'
import Laptop from '../assets/laptop.png'

import { useEffect } from 'react'
import supabase from '../utils/supabase.ts'
import { User } from '@supabase/supabase-js'
import { Profile } from '../utils/types'

function ThankYou() {

    const navigate = useNavigate() //used to redirect to different page

    //checking for existing user session
    useEffect(() => {
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

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-white text-2xl sm:text-5xl md:text-7xl font-bold font-bitter leading-large tracking-widest capitalize drop-shadow-md mt-20">
                Thank you!
            </h1>

            <img src={Laptop} alt="Laptop" className="w-[50%] h-auto" />
            <Link to="/">
                <button className="bg-[#FFE017] cursor-pointer text-white font-bold text-xl md:text-xl px-10 md:px-20 py-2 rounded-full shadow-md hover:brightness-105 transition mb-5 md:mb-10">
                    HOME
                </button>
            </Link>
        </div>
    );
}

export default ThankYou;
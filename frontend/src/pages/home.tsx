import { Link } from 'react-router-dom'
import Laptop from '../assets/laptop.png'
import { useEffect, useState } from 'react'
import supabase from '../utils/supabase.ts'

import Alert from "../components/alert";
import { useLocation } from 'react-router-dom'

function Home() {
    const location = useLocation();
    const showBadgeAlert = location.state?.alertText;

    const [isLoggedIn, setIsLoggedIn] = useState(false);


    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };

        checkSession();
    }, []);

    const [stats, setStats] = useState({
        devices: 0,
        clients: 0,
        co2: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await supabase.from('devices').select('*');

            if (error) {
                console.error('Error fetching devices:', error.message);
                return;
            }

            const devicesCount = data.length;
            const uniqueClients = new Set(data.map((d) => d.user_id)).size;
            const totalCO2 = data.reduce((sum, d) => sum + (d.co2_emissions || 0), 0);

            setStats({
                devices: devicesCount,
                clients: uniqueClients,
                co2: Math.round(totalCO2),
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            {showBadgeAlert && <Alert text={showBadgeAlert} show={true} />}
            {/* Get Started Section */}
            <section className="flex w-full h-[80vh] px-8 py-12 justify-between items-center gap-4 z-0">

                {/* Left: Title + description + button */}
                <div className="w-full md:w-1/2 flex-col items-center text-center justify-center text-white gap-7 ">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-md mb-5 md:mb-10">
                        E-WASTE CALCULATOR
                    </h1>
                    <p className="text-lg sm:text-xl font-semibold mb-10 md:mb-25">
                        Bridging the Digital Divide Worldwide
                    </p>
                    <Link to={isLoggedIn ? "/device-info-submission" : "/login"}>
                        <button className="bg-[#FFE017] cursor-pointer text-white font-bold text-xl md:text-2xl px-10 md:px-20 py-3 rounded-full shadow-md hover:brightness-105 transition mb-5 md:mb-10">
                            {isLoggedIn ? "GET STARTED" : "LOGIN"}
                        </button>
                    </Link>
                </div>

                {/* Right: Laptop Image */}
                <div className=" hidden md:flex w-1/2 justify-center z-0">
                    <img src={Laptop} alt="Laptop" className="w-[110%] h-auto max-w-[925px]" />
                </div>
            </section>

            {/* Stats Section */}
            <div className="w-full bg-white py-10 px-4 flex flex-wrap justify-center gap-6">
                {[
                    { heading: stats.devices.toString(), subtext: 'Devices Collected' },
                    { heading: stats.clients.toString(), subtext: 'Clients Donated' },
                    { heading: stats.co2.toLocaleString(), subtext: 'Pounds Of CO2 Saved' },
                    { heading: 'MISSION', subtext: 'To be the bridge to the digital divide.' },
                    { heading: 'IMPACT', subtext: 'Provide students access to affordable digital education.' },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="bg-[#FFF9DB] border border-[#FFE017] rounded-xl shadow-md sm:w-64 w-full px-6 py-8 text-center"
                    >
                        <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-5">{item.heading}</p>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mt-2 text-black">{item.subtext}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
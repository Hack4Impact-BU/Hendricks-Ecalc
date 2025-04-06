import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

export default function AboutUs(){
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            setIsAdmin(session?.user?.email?.endsWith('@gmail.com') || false);
        });
        return () => authListener.subscription.unsubscribe(); //clean up
    }, [isAdmin]);

    return (
        <>
            <div className="flex flex-col justify-evenly items-centerrounded-lg m-4 px-10 py-4">
                <div className="flex flex-row justify-evenly items-center w-full h-[40vh] mb-[5vh] mt-[5vh]">
                    <div className="bg-white/50 backdrop-blur-md w-[30%] h-full rounded-[50px] items-center"> 
                        <img src="" alt="Dean's Picture" className="object-cover"/>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4 w-[30%] h-full">
                        <h1 className="text-center text-5xl text-white" style={{textShadow: "1px 1px 5px gray"}}>Our Founder</h1>
                        <p className="text-center text-2xl text-white" style={{textShadow: "1px 1px 5px gray"}}>
                            Dean Hendricks, founder and director, has a vision to bridge the digital divide by refurbishing devices.
                        </p>
                        {// If the user is an admin, show the edit button
                            isAdmin && <button 
                                className="bg-[#FFE017] mt-[3vh] shadow-md text-white text-3xl rounded-full w-auto px-10 py-1 transition duration-200 cursor-pointer hover:brightness-105"
                                type="button"
                            >Edit</button>
                        }
                    </div>
                </div>
                <div className="flex flex-row justify-evenly items-center w-full h-[40vh] mb-[5vh] mt-[5vh]">
                    <div className="flex flex-col justify-center items-center gap-4 w-[30%] h-full">
                        <h1 className="text-center text-5xl text-white" style={{textShadow: "1px 1px 5px gray"}}>Our Goal</h1>
                        <p className="text-center text-2xl text-white" style={{textShadow: "1px 1px 5px gray"}}>
                            Old laptops are donated and Students learn how to repair the laptops to take home. With this we want to track information about the laptop!
                        </p>
                        {// If the user is an admin, show the edit button
                            isAdmin && <button 
                                className="bg-[#FFE017] mt-[3vh] shadow-md text-white text-3xl rounded-full w-auto px-10 py-1 transition duration-200 cursor-pointer hover:brightness-105"
                                type="button"
                            >Edit</button>
                        }
                    </div>
                    <div className="bg-white/50 backdrop-blur-md w-[30%] h-full rounded-[50px] items-center"> 
                        <img src="" alt="Picture" className="object-cover"/>
                    </div>
                </div>
                <div className="flex flex-row justify-evenly items-center w-full h-[40vh] mb-[5vh] mt-[5vh]">
                    <div className="bg-white/50 backdrop-blur-md w-[30%] h-full rounded-[50px] items-center"> 
                        <img src="" alt="Dean's Picture" className="object-cover"/>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4 w-[30%] h-full">
                        <h1 className="text-center text-5xl text-white" style={{textShadow: "1px 1px 5px gray"}}>Ewaste Impact</h1>
                        <p className="text-center text-2xl text-white" style={{textShadow: "1px 1px 5px gray"}}>
                        Tracks and Calculates the weight of device, the emissions produced, how much emissions saved, and what happens to the product.
                        </p>
                        {// If the user is an admin, show the edit button
                            isAdmin && <button 
                                className="bg-[#FFE017] mt-[3vh] shadow-md text-white text-3xl rounded-full w-auto px-10 py-1 transition duration-200 cursor-pointer hover:brightness-105"
                                type="button"
                            >Edit</button>
                        }
                    </div>
                </div>
            </div>
            
        </>
    )
}
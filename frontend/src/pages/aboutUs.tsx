/*
    Modify the text contents of this page to change what is displayed on the about us page.
*/
import { useEffect, useState } from "react";
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
        /* This is the main container for the About Us page */
        <div className="flex flex-col gap-16 px-4 py-8 md:px-10 md:py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="w-full">
                    {/* This is the image section for the founder */}
                    <img
                        src="https://cdn.dorik.com/661bed391d6c29001137f946/images/Dean-Hendricks-_-Founder-Director-President-nxccF.jpg" //modify this link if you want to change the image
                        alt="Dean's Picture"
                        className="w-full max-w-[500px] h-auto rounded-[30px] object-cover"
                    />
                </div>
                {/* This is the text section for the founder. Modify to change what text is displayed */}
                <div className="flex flex-col justify-center items-center text-center gap-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white" style={{ textShadow: "1px 1px 5px gray" }}>Our Founder</h1>
                    <p className="text-lg md:text-2xl text-white" style={{ textShadow: "1px 1px 5px gray" }}>
                        Dean Hendricks, founder and director, has a vision to bridge the digital divide by refurbishing devices.
                    </p>
                </div>
            </div>

            {/* This is the middle section of the page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* This is the text section for the middle section. Modify to change what text is displayed */}
                <div className="order-2 md:order-1 flex flex-col justify-center items-center text-center gap-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white" style={{ textShadow: "1px 1px 5px gray" }}>Our Goal</h1>
                    <p className="text-lg md:text-2xl text-white" style={{ textShadow: "1px 1px 5px gray" }}>
                        Old laptops are donated and Students learn how to repair the laptops to take home. With this we want to track information about the laptop!  
                    </p>
                </div>
                <div className="w-full flex justify-end order-1 md:order-2">
                    {/* This is the image section for the founder */}
                    <img
                        src="https://cdn.dorik.com/661bed391d6c29001137f946/images/Dean-Hendricks-_-Founder-Director-President-nxccF.jpg" //modify this if you want to change the image
                        alt="Dean's Picture"
                        className="w-full max-w-[500px] h-auto rounded-[30px] object-cover"
                    />
                </div>
            </div>

            {/* This is the bottom section of the page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="w-full">
                    {/* This is the image section of the bottom section of the page*/}
                    <img
                        src="https://cdn.dorik.com/661bed391d6c29001137f946/images/Dean-Hendricks-_-Founder-Director-President-nxccF.jpg" //modify this if you want to change the image
                        alt="Dean's Picture"
                        className="w-full max-w-[500px] h-auto rounded-[30px] object-cover"
                    />
                </div>
                {/* This is the text section of the bottom section of the page. Modify to change what text is displayed */}
                <div className="flex flex-col justify-center items-center text-center gap-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white" style={{ textShadow: "1px 1px 5px gray" }}>E-waste Impact</h1>
                    <p className="text-lg md:text-2xl text-white" style={{ textShadow: "1px 1px 5px gray" }}>
                        Tracks and Calculates the weight of device, the emissions produced, how much emissions saved, and what happens to the product.
                    </p>
                </div>
            </div>
        </div>
    )
}
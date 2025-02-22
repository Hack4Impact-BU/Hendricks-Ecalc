import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { useNavigate } from "react-router-dom";


const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        company: "",
        email: "",
    });


    const [editingProfile, setEditingProfile] = useState(false); // Toggle profile edit mode
    const [editingEmail, setEditingEmail] = useState(false); // Toggle email edit mode
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailUpdateMessage, setEmailUpdateMessage] = useState("");


    const navigate = useNavigate();

    // checking for existing user session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
            if (!session) {
                navigate("/login");
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]);


    useEffect(() => {
        async function fetchUserAndProfile() {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData?.user) {
                console.error("Error fetching user:", authError?.message);
                return;
            }


            const userId = authData.user.id;
            setUser(authData.user);


            // Fetch profile details from Supabase
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("first_name, last_name, company, email")
                .eq("id", userId)
                .single();


            if (profileError) {
                console.error("Error fetching profile:", profileError.message);
                return;
            }


            setProfile({
                first_name: profileData.first_name || "",
                last_name: profileData.last_name || "",
                company: profileData.company || "",
                email: profileData.email || "",
            });
        }


        fetchUserAndProfile();
    }, []);


    // Handle profile update (first name, last name, company)
    const handleProfileUpdate = async () => {
        if (!user) return;


        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: profile.first_name.trim(),
                last_name: profile.last_name.trim(),
                company: profile.company.trim(),
            })
            .eq("id", user.id);


        if (error) {
            console.error("Profile update error:", error.message);
            alert("Failed to update profile.");
        } else {
            alert("Profile updated successfully!");
            setEditingProfile(false); // Exit edit mode
        }
    };


    const handleEmailUpdate = async () => {
        if (!user || !newEmail.trim() || !confirmEmail.trim()) return;
        if (newEmail.trim() !== confirmEmail.trim()) {
            alert("Emails do not match.");
            return;
        }

        // Call the Supabase RPC function
        const { data, error } = await supabase.rpc("change_user_email", {
            new_email: newEmail.trim(),
        });

        if (error) {
            console.error("Email update error:", error.message);
            alert("Failed to update email. " + error.message);
        } else {
            setEmailUpdateMessage("Email updated successfully");
            setEditingEmail(false);
        }
    };



    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col w-1/3 p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100">
                <h1 className="text-2xl text-center mb-4 font-bold">Profile</h1>


                {/* User Profile Display */}
                {!editingProfile ? (
                    <>
                        <p><strong>Full Name:</strong> {profile.first_name} {profile.last_name}</p>
                        <p><strong>Company:</strong> {profile.company}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <button
                            className="border p-2 w-full mt-4 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            onClick={() => setEditingProfile(true)}
                        >
                            Edit Profile
                        </button>
                    </>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} className="flex flex-col gap-4">
                        <div>
                            <label className="flex">First Name:</label>
                            <input
                                type="text"
                                value={profile.first_name}
                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="flex">Last Name:</label>
                            <input
                                type="text"
                                value={profile.last_name}
                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="flex">Company:</label>
                            <input
                                type="text"
                                value={profile.company}
                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className="border p-2 w-full items-center rounded-md bg-gray-400 hover:bg-gray-300 cursor-pointer"
                                onClick={() => setEditingProfile(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="border p-2 w-full items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            >
                                Save Changes
                            </button>

                        </div>
                    </form>
                )}


                <hr className="my-6" />


                {/* Email Section */}
                {!editingEmail ? (
                    <>
                        <p><strong>Current Email:</strong> {profile.email}</p>
                        <button
                            className="border p-2 w-full mt-4 items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            onClick={() => setEditingEmail(true)}
                        >
                            Change Email
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col gap-4 mt-4">
                        {/* Non-editable current email field */}
                        <div>
                            <label className="flex">Current Email:</label>
                            <input
                                type="text"
                                value={profile.email}
                                disabled
                                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="flex">New Email:</label>
                            <input
                                type="text"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        <div>
                            <label className="flex">Confirm New Email:</label>
                            <input
                                type="text"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                            />
                        </div>
                        {/* Submit & Cancel Buttons */}
                        <div className="flex gap-4">
                            <button
                                className="border p-2 w-full items-center rounded-md bg-gray-400 hover:bg-gray-300 cursor-pointer"
                                onClick={() => setEditingEmail(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEmailUpdate}
                                className="border p-2 w-full items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600"
                            >
                                Submit Email Change
                            </button>
                        </div>
                    </div>
                )}


                {emailUpdateMessage && (
                    <p className="mt-4 text-green-600 text-sm text-center">{emailUpdateMessage}</p>
                )}
            </div>
        </div>
    );
};


export default Profile;
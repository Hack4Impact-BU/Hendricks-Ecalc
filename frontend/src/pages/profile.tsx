import { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import { AuthResponse } from '@supabase/supabase-js'
import { useNavigate } from "react-router-dom";
import profilePlaceholder from "../assets/profile_placeholder.jpg";
import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';
import { getQuarterlyData, getOneYearMonthlyData, getFiveYearData, getAllTimeData } from '../utils/lineChartUtils';
import { currentBadges } from "../utils/api";
import ProfileImageUploadModal from '../components/profileImageUploadModal';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchIcon from '@mui/icons-material/Search';
import { User } from "@supabase/supabase-js";
import { Profile } from "../utils/types";

interface Badge {
    id: number;
    name: string;
}

const UserProfile = () => {

    const [activeTab, setActiveTab] = useState<'Account' | 'Devices' | 'E-Waste'>('Account');

    //account info
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        company: "",
    });

    const [editingProfile, setEditingProfile] = useState(false); // Toggle profile edit mode
    const [editingEmail, setEditingEmail] = useState(false); // Toggle email edit mode
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [emailUpdateMessage, setEmailUpdateMessage] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    //show/hide image upload modal
    const [showModal, setShowModal] = useState(false);

    //password change
    const [currentPassword, setPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>();
    const [confirmPassword, setConfirmPassword] = useState<string>();
    const [passLenErrorCurr, setPassLenErrorCurr] = useState(false);
    const [passLenErrorNew, setPassLenErrorNew] = useState(false);
    const [passwordConfirmError, setPasswordConfirmError] = useState(false);
    const [wrongPassword, setWrongPasswordError] = useState(false);

    //Devices table 
    const [devices, setDevices] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    //Line Chart Data
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [selectedRange, setSelectedRange] = useState('Quarter');

    //Badges
    const [badges, setBadges] = useState<Badge[]>([]);

    const frontendURL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

    /**
     * @returns Uses the signInWithPassword to check if the current password the user inputs is the one tied to the 
     * account. Then will update the password accordingly.
     */
    const changePassword = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        if (currentPassword && currentPassword.length >= 8) {
            setPassLenErrorCurr(false);
        } else {
            setPassLenErrorCurr(true);
        }

        if (newPassword && newPassword.length >= 8) {
            setPassLenErrorCurr(false);
        } else {
            setPassLenErrorCurr(true);
        }

        if (newPassword === confirmPassword) {
            setPasswordConfirmError(false);
        } else {
            setPasswordConfirmError(true);
        }

        const { data:_passwordData, error }: AuthResponse = await supabase.auth.signInWithPassword({
            email: email,
            password: currentPassword,
        })

        // error handling
        if (error) {
            setWrongPasswordError(true);
            return;
        }

        // Update password in Supabase
        const { data:_user, error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            alert(updateError.message);
            return;
        }

        alert('Password updated successfully!');

    }

    const navigate = useNavigate();

    // checking for existing user session
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
            if (!session) {
                navigate("/login");
            }
            else {
                async function fetchUserAndProfile() {
                    const { data: authData, error: authError } = await supabase.auth.getUser();
                    if (authError || !authData?.user) {
                        console.error("Error fetching user:", authError?.message);
                        return;
                    }

                    const userId = authData.user.id;
                    setUser(authData.user);
                    setEmail(authData.user.email || "");

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
                    });

                    fetchUserBadges(userId);
                    fetchUserDevices(userId);
                    fetchProfileImage(userId);
                }

                checkUser(session.user);
                fetchUserAndProfile();
            }
        });

        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]);

    const fetchProfileImage = async (userId: string) => {
        const { data: files, error } = await supabase.storage
            .from('profile-pics')
            .list(userId); // list files inside the user's folder

        if (error) {
            console.error("Failed to list profile image:", error.message);
            return;
        }

        // Check if profile.jpg exists
        const profileExists = files?.some(file => file.name === "profile.jpg");

        if (profileExists) {
            const { data, error } = await supabase
                .storage
                .from('profile-pics')
                .createSignedUrl(`${userId}/profile.jpg`, 60);

            if (error || !data?.signedUrl) {
                console.error('Failed to generate signed URL', error);
                return;
            }

            setProfileImageUrl(data.signedUrl);

        } else {
            setProfileImageUrl(null); // fallback to placeholder
        }
    };

    //Setting line chart data
    useEffect(() => {
        if (selectedRange === 'Quarter') {
            setLineChartData(getQuarterlyData(devices));
        } else if (selectedRange === '1 Year') {
            setLineChartData(getOneYearMonthlyData(devices));
        } else if (selectedRange === '5 Years') {
            setLineChartData(getFiveYearData(devices));
        } else if (selectedRange === 'All Time') {
            setLineChartData(getAllTimeData(devices));
        }
    }, [devices, selectedRange]);

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
            //alert("Profile updated successfully!");
            setEditingProfile(false); // Exit edit mode
        }
    };

    const handleEmailUpdate = async () => {
        if (!user || !newEmail.trim() || !confirmEmail.trim()) return;
        if (newEmail.trim() !== confirmEmail.trim()) {
            alert("Emails do not match.");
            return;
        }

        // Use updateUser() to change the email in auth.users
        //const{ error } = await supabase.auth.updateUser({email: newEmail.trim(),});

        const { error } = await supabase.auth.updateUser(
            {
                email: newEmail.trim(), // New email
            },
            {
                emailRedirectTo: `${frontendURL}/login`, // Redirect to login after confirmation
            }
        );

        if (error) {
            console.error("Email update error:", error.message);
            alert("Failed to update email: " + error.message);
        } else {
            setEmailUpdateMessage(
                "A confirmation email has been sent to your new email. Please verify it."
            );
            setEditingEmail(false);
        }
    };


    // Handle password changes for dynamic validation
    const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setPassword(password);

        if (password.length >= 8) {
            setPassLenErrorCurr(false);
        } else {
            setPassLenErrorCurr(true);
        }
    };

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setNewPassword(password);

        if (password.length >= 8) {
            setPassLenErrorNew(false);
        } else {
            setPassLenErrorNew(true);
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setConfirmPassword(password);

        // Check password to see if its the same as new
        if (newPassword === password) {
            setPasswordConfirmError(false);
        } else {
            setPasswordConfirmError(true);
        }
    };

    // Fetch user badges
    const fetchUserBadges = async (userId: string) => {

        // Extract badge IDs
        const badgeIds = await currentBadges(userId);

        if (badgeIds) {
            // Fetch badge details
            const { data: badgesData, error: badgesError } = await supabase
                .from("badges")
                .select("*")
                .in("id", badgeIds);

            if (badgesError) {
                console.error("Error fetching badge details:", badgesError.message);
                return;
            }
            setBadges(badgesData || []);
        } else {
            setBadges([]);
        }
    };

    //fetch user devices
    const fetchUserDevices = async (userId: string) => {
        const { data, error } = await supabase
            .from("devices")
            .select("*")
            .eq("user_id", userId)
            .order("date_donated", { ascending: true });

        if (error) {
            console.error("Error fetching devices:", error.message);
            return;
        }

        setDevices(data || []);
    };

    const [_uploadSuccess, setUploadSuccess] = useState(false);

    const handleUpload = async (file: File) => {
        if (!file || !user) return;

        const filePath = `${user.id}/profile.jpg`;

        const { error } = await supabase.storage
            .from('profile-pics')
            .upload(filePath, file, {
                upsert: true, // overwrite if it already exists
            });

        if (error) {
            alert("Upload failed: " + error.message);
            return;
        }
        else {
            setUploadSuccess(true);
            setShowModal(false);
            fetchProfileImage(user.id);
        }
    };



    return (
        <div className='flex flex-col justify-center items-center'>

            <div className="w-full flex justify-center mt-6 mb-3 w-full">
                <div className="flex w-[90%] sm:w-[70%] max-w-[1200px] p-1 sm:p-2 bg-white rounded-full shadow-md overflow-hidden">
                    {['Account', 'Devices', 'E-Waste'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'Account' | 'Devices' | 'E-Waste')}
                            className={`flex-1 px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold transition-all duration-200 ${activeTab === tab
                                ? 'bg-[#2E7D32] text-white rounded-full'
                                : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>


            <div className="mt-8 w-[90%] sm:w-[70%] max-w-[1200px] flex justify-center border p-8 border-gray-300 rounded-3xl bg-white shadow-md mb-10">

                {activeTab === 'Account' && (
                    <div className="w-full max-w-5xl">
                        <div className="w-full flex flex-col md:p-5">

                            {/* User Profile Display */}
                            {!editingProfile ? (
                                <div className="md:p-5">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-gray-400 bg-gray-200 overflow-visible">
                                            <img
                                                src={profileImageUrl || profilePlaceholder}
                                                alt="Profile Placeholder"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-md"
                                            >
                                                <EditRoundedIcon className="text-gray-700 cursor-pointer" fontSize="small" />
                                            </button>

                                            <ProfileImageUploadModal
                                                isOpen={showModal}
                                                onClose={() => setShowModal(false)}
                                                onUpload={handleUpload}
                                            />
                                        </div>


                                        <div>
                                            <h2 className="text-2xl font-bold text-black">
                                                {profile.first_name} {profile.last_name}
                                            </h2>
                                            <p className="text-lg text-gray-500">{email}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 space-y-4 text-lg">
                                        <div className="flex justify-between border-b pb-4">
                                            <span className="font-semibold text-black">Name</span>
                                            <span>{profile.first_name} {profile.last_name}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-4">
                                            <span className="font-semibold text-black">Email</span>
                                            <span>{email}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-4">
                                            <span className="font-semibold text-black">Password</span>
                                            <span>********</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-4">
                                            <span className="font-semibold text-black">Company</span>
                                            <span>{profile.company}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-4">
                                            <span className="font-semibold text-black">Account Created</span>
                                            <span className="text-gray-400 text-sm">
                                                {user?.created_at ? new Date(user.created_at).toLocaleString() : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-6">
                                        <button
                                            className="bg-[#2E7D32] cursor-pointer text-white text-lg font-semibold py-3 px-12 rounded-full shadow hover:brightness-105 transition"
                                            onClick={() => setEditingProfile(true)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>






                            ) : (
                                <div className="flex flex-col gap-8">

                                    {/* Profile Form */}
                                    <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }} className="bg-white rounded-xl shadow-md p-6 space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-semibold">First Name</label>
                                            <input
                                                type="text"
                                                value={profile.first_name}
                                                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 bg-white"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-semibold">Last Name</label>
                                            <input
                                                type="text"
                                                value={profile.last_name}
                                                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 bg-white"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-semibold">Company</label>
                                            <input
                                                type="text"
                                                value={profile.company}
                                                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 bg-white"
                                            />
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingProfile(false)}
                                                className="w-full rounded-full bg-gray-300 hover:bg-gray-200 text-sm font-semibold py-2 cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="w-full cursor-pointer rounded-full bg-[#2E7D32] text-white hover:brightness-105 text-sm font-semibold py-2"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>

                                    {/* Email Update */}
                                    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                                        <h2 className="font-bold text-lg">Update Email</h2>
                                        {!editingEmail ? (
                                            <>
                                                <p className="text-sm text-gray-700"><strong>Current Email:</strong> {email}</p>
                                                <button
                                                    onClick={() => setEditingEmail(true)}
                                                    className="mt-2 w-full rounded-full bg-[#2E7D32] text-white hover:brightness-105 py-2 text-sm font-semibold cursor-pointer"
                                                >
                                                    Change Email
                                                </button>
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="font-semibold">Current Email</label>
                                                    <input
                                                        type="text"
                                                        value={email}
                                                        disabled
                                                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold">New Email</label>
                                                    <input
                                                        type="text"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-semibold">Confirm New Email</label>
                                                    <input
                                                        type="text"
                                                        value={confirmEmail}
                                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                                    />
                                                </div>
                                                <div className="flex gap-4 pt-2">
                                                    <button
                                                        onClick={() => setEditingEmail(false)}
                                                        className="w-full rounded-full bg-gray-300 hover:bg-gray-200 text-sm font-semibold py-2 cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleEmailUpdate}
                                                        className="w-full rounded-full bg-[#2E7D32] text-white hover:brightness-105 text-sm font-semibold py-2 cursor-pointer"
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                                {emailUpdateMessage && (
                                                    <p className="text-green-600 text-sm text-center pt-2">{emailUpdateMessage}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Change */}
                                    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                                        <h2 className="font-bold text-lg text-center">Change Password</h2>
                                        <form onSubmit={changePassword} className="space-y-4">
                                            <div>
                                                <label className="font-semibold">Current Password</label>
                                                <input
                                                    type="password"
                                                    onChange={handleCurrentPasswordChange}
                                                    required
                                                    placeholder="********"
                                                    className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                                />
                                                {passLenErrorCurr && <p className="text-red-500 text-sm">Password must be at least 8 characters.</p>}
                                                {wrongPassword && <p className="text-red-500 text-sm">Incorrect password.</p>}
                                            </div>
                                            <div>
                                                <label className="font-semibold">New Password</label>
                                                <input
                                                    type="password"
                                                    onChange={handleNewPasswordChange}
                                                    required
                                                    placeholder="********"
                                                    className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                                />
                                                {passLenErrorNew && <p className="text-red-500 text-sm">Password must be at least 8 characters.</p>}
                                            </div>
                                            <div>
                                                <label className="font-semibold">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    onChange={handleConfirmPasswordChange}
                                                    required
                                                    placeholder="********"
                                                    className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                                />
                                                {passwordConfirmError && <p className="text-red-500 text-sm">Passwords do not match.</p>}
                                            </div>
                                            <div className="flex justify-center pt-2">
                                                <button
                                                    type="submit"
                                                    className="w-1/2 rounded-full bg-[#2E7D32] text-white hover:brightness-105 text-sm font-semibold py-2 cursor-pointer"
                                                >
                                                    Change Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Devices' && (
                    <div className="w-full">
                        <div className="flex flex-col justify-center mt-4 bg-white md:px-5">

                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="flex items-center border border-[#989292] rounded-md px-3 py-2 bg-white">
                                    <SearchIcon className="text-gray-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Devices Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-[#989292] text-[#4A4949] ">
                                    <thead>
                                        <tr className="border-b border-[#989292]">
                                            <th className="py-2 px-4 font-bold">Device ID</th>
                                            <th className="py-2 px-4 font-bold">Type</th>
                                            <th className="py-2 px-4 font-bold">Model</th>
                                            <th className="py-2 px-4 font-bold">Manufacturer</th>
                                            <th className="py-2 px-4 font-bold">Date Donated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {devices
                                            .filter((device) => {
                                                const formattedDate = new Date(device.date_donated).toLocaleDateString();

                                                return [
                                                    //searches keyword in these values
                                                    device.device_id,
                                                    device.device_type,
                                                    device.model,
                                                    device.manufacturer,
                                                    formattedDate //to skip timestamp bits using formatted date
                                                ].some((val) =>
                                                    String(val).toLowerCase().includes(searchQuery.toLowerCase().trim())
                                                );
                                            })
                                            .map((device, _idx) => (
                                                <tr
                                                    key={device.id}
                                                    className={`border-b border-[#989292] hover:bg-gray-50 transition ${!device.verified ? 'text-[#B44848] font-semibold' : 'text-[#656565] font-semibold'}`}
                                                >
                                                    <td className="py-2 px-4">{device.device_id}</td>
                                                    <td className="py-2 px-4">{device.device_type}</td>
                                                    <td className="py-2 px-4">{device.model}</td>
                                                    <td className="py-2 px-4">{device.manufacturer}</td>
                                                    <td className="py-2 px-4">{new Date(device.date_donated).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Legend */}
                            <div className="flex justify-center items-center gap-8 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-[#656565]" />
                                    <span className="text-sm text-[#656565]"><strong>Verified</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-[#B44848]" />
                                    <span className="text-sm text-[#B44848]"><strong>Unverified</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'E-Waste' && (
                    <div>
                        {/* Badges Section */}
                        <div>
                            <div className="w-full max-w-5xl bg-white/50 backdrop-blur-md rounded-xl p-6 shadow-sm mb-8 relative">

                                {/* Dropdown remains unchanged */}
                                <div className="absolute top-4 right-4 z-10">
                                    <select
                                        value={selectedRange}
                                        onChange={(e) => setSelectedRange(e.target.value)}
                                        className="cursor-pointer text-gray-800 font-medium px-5 py-1 rounded-md shadow-sm bg-white/50 focus:outline-none focus:ring-1 focus:ring-gray-400 text-xs sm:text-sm"
                                    >
                                        <option value="Quarter" >Quarter</option>
                                        <option value="1 Year">1 Year</option>
                                        <option value="5 Years">5 Years</option>
                                        <option value="All Time">All Time</option>
                                    </select>
                                </div>

                                <h2 className="font-semibold">Total Emissions</h2>
                                <Box
                                    sx={{
                                        width: '90%',
                                        margin: '0 auto',
                                        position: 'relative',
                                    }}
                                >
                                    <div className="relative w-full">

                                        {/* LineChart will fill the width of its container */}
                                        <LineChart
                                            height={400}
                                            series={[
                                                { data: lineChartData.map((d) => d.metals), label: 'Metals', color: "#6B4226" },
                                                { data: lineChartData.map((d) => d.plastics), label: 'Plastics', color: "#15803D" },
                                                { data: lineChartData.map((d) => d.co2), label: 'CO2 Emissions', color: "#A7D7A8" },
                                            ]}
                                            xAxis={[{ data: lineChartData.map((d) => d.label), scaleType: 'point' }]}
                                            yAxis={[{ scaleType: 'linear' }]}
                                            grid={{ vertical: true, horizontal: true }}
                                            slotProps={{
                                                legend: { hidden: true },
                                            }}
                                            sx={{
                                                width: '100%',
                                                marginBottom: '1rem',
                                            }}
                                        />

                                        {/* Custom legend pinned to bottom-left of the chart */}
                                        <div
                                            className="absolute justify-center sm:left-12 bottom-1 flex gap-2 sm:gap-6 items-center text-xs sm:text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#6B4226]" />
                                                <span className=" text-[#000000] font-semibold">Metals</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#15803D]" />
                                                <span className=" text-[#000000] font-semibold">Plastics</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-[#A7D7A8]" />
                                                <span className=" text-[#000000] font-semibold">CO2 Emissions</span>
                                            </div>
                                        </div>
                                    </div>
                                </Box>



                            </div>

                            <h1 className="text-2xl text-center mb-4 font-bold">Badges</h1>
                            <div className="w-full max-w-5xl flex flex-wrap gap-2 mt-2 justify-center p-6 shadow-sm mb-8 bg-[#D9D9D9] backdrop-blur-md rounded-xl">
                                {badges.length > 0 ? (
                                    badges.map((badge, index) => (
                                        <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-md text-sm">
                                            {badge.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No badges earned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>





        </div >
    );
};

export default UserProfile;

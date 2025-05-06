/**
 * profile.tsx
 * 
 * This is the profile page for authenticated users.
 * 
 * 
 * Features:
 * 
 * Account Section:
 * - Allows users to view and update their profile information (name, email, password, company, profile picture).
 * - Supports profile image uploads via Supabase Storage.
 * 
 * Devices Section:
 * - Displays donated devices with a searchable table.
 * - Unverified devices are written in red and verified written in gray
 * 
 * E-Waste Section:
 * - Allows users to view their emissions data over different time periods using a dynamic line chart (quarterly, monthly, 5-year, all-time).
 * - Lists user-earned badges based on their contributions.
 * 
 */

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
import { Profile, Badge } from "../utils/types";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const UserProfile = () => {

    // Controls which tab is currently active on the profile page: "Account", "Devices", or "E-Waste"
    const [activeTab, setActiveTab] = useState<'Account' | 'Devices' | 'E-Waste'>('Account');

    //account info
    const [user, setUser] = useState<any>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
    });
    const [company, setCompany] = useState("")
    const [email, setEmail] = useState("");

    // First and last name values for editing (pre-filled from `profile`)
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");

    // Company name being edited
    const [newCompany, setNewCompany] = useState("");

    // New email input and its confirmation value
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");

    // Message shown after email update request is triggered
    const [emailUpdateMessage, setEmailUpdateMessage] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState("");


    // Tracks which field is currently being edited: name, email, password, or company
    // If null, all editable sections are collapsed
    const [editingField, setEditingField] = useState<null | 'name' | 'email' | 'password' | 'company'>(null);


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

    // - Filters the list of devices based on the search query
    // - Matches the query against device ID, type, model, manufacturer, and formatted donation date
    const filteredDevices = devices.filter((device) => {
        const formattedDate = new Date(device.date_donated).toLocaleDateString();
        return [
            device.device_id,
            device.device_type,
            device.model,
            device.manufacturer,
            formattedDate
        ].some((val) =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
    });

    // Pagination state for the devices table
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const itemsPerPage = 20; // Defines how many devices to show per page — adjust this if you wish to show more or fewer
    const totalPages = Math.max(1, Math.ceil(filteredDevices.length / itemsPerPage));

    //Line Chart Data
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [selectedRange, setSelectedRange] = useState('Quarter');

    //Badges
    const [badges, setBadges] = useState<Badge[]>([]);

    const navigate = useNavigate();

    const frontendURL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";


    // Check if user is authenticated and 2FA-verified; redirect to /login if not
    // If authenticated, fetches and loads user profile, devices, badges, and profile image
    useEffect(() => {

        //Checks whether the user exists in the `profiles` table and is 2FA-verified.
        //If the user is not found or 2FA is not completed, redirect to the login page.
        async function checkUser(user: User) {
            const { data: rawData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // If no profile is found or there is an error, redirect to login
            if (userError || !rawData) {
                console.error("Profile lookup failed", userError);
                navigate("/login");
                return;
            }

            const userData = rawData as Profile;

            // If user has not completed 2FA verification, redirect to login
            if (userData.two_fa_verified === false) {
                navigate("/login");
            }
        }

        // Subscribe to Supabase auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {

            // Case 1: No active session — redirect to login
            if (!session) {
                navigate("/login");
            }
            // Case 2: User is logged in — verify and fetch user profile
            else {


                //Fetches the current authenticated user from Supabase,
                //loads profile information, and fetches related user data.
                async function fetchUserAndProfile() {
                    const { data: authData, error: authError } = await supabase.auth.getUser();

                    // If user fetching fails, log and return
                    if (authError || !authData?.user) {
                        console.error("Error fetching user:", authError?.message);
                        return;
                    }

                    const userId = authData.user.id;

                    // Store authenticated user object and email in state
                    setUser(authData.user);
                    setEmail(authData.user.email || "");

                    // Fetch user's profile info from `profiles` table
                    const { data: profileData, error: profileError } = await supabase
                        .from("profiles")
                        .select("first_name, last_name, company, email")
                        .eq("id", userId)
                        .single();

                    // Handle profile fetch error
                    if (profileError) {
                        console.error("Error fetching profile:", profileError.message);
                        return;
                    }

                    // Set profile details into state (fallback to empty strings if undefined)
                    setProfile({
                        first_name: profileData.first_name || "",
                        last_name: profileData.last_name || "",
                    });
                    setCompany(profileData.company || "");

                    // Fetch additional user-related data (badges, devices, and profile image) 
                    // using helper functions defined in this file                    
                    fetchUserBadges(userId);
                    fetchUserDevices(userId);
                    fetchProfileImage(userId);
                }

                //if session exist call the async function above
                checkUser(session.user);
                fetchUserAndProfile();
            }
        });

        // Cleanup: unsubscribe from auth state listener when component unmounts
        return () => authListener.subscription.unsubscribe(); //clean up
    }, [navigate]); // Dependency: re-run if `navigate` function changes


    /**
    * Fetches the user's profile image from Supabase Storage.
    * - Profile image is named 'profile.jpg' and stored in a folder named after the user ID.
    * - Uses a longer expiration time (3 days) to avoid frequent refreshes.
    * - If no image exists or the folder is missing, falls back to a placeholder image.
    */
    const fetchProfileImage = async (userId: string) => {

        // Try to generate a signed URL for the expected profile.jpg file
        const { data, error } = await supabase
            .storage
            .from('profile-pics')
            .createSignedUrl(`${userId}/profile.jpg`, 60 * 60 * 24 * 3); // 60-second signed URL

        if (error || !data?.signedUrl) {
            // File likely doesn't exist or URL couldn't be generated
            console.error('Failed to generate signed URL for profile image:', error?.message);
            setProfileImageUrl(null); // Fallback to placeholder
            return;
        }

        // Signed URL generated successfully — update image state
        setProfileImageUrl(data.signedUrl);
    };

    /**
     * useEffect hook to update the emissions line chart data whenever:
     * - The list of devices changes (e.g., after fetch)
     * - The selected time range changes (e.g., user selects "Quarter", "1 Year", etc.)
     * 
     * Uses helper functions from `../utils/lineChartUtils` to format the data for each range.
     */
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


    /**
     * Handles updating the user's first and last name in the 'profiles' table.
     * 
     * 1. Ensures a user is logged in before proceeding.
     * 2. Sends the trimmed input values to Supabase to update the profile.
     * 3. If successful, updates local state to reflect the new name.
     * 4. Handles and displays errors if the update fails.
     */
    const handleProfileUpdate = async () => {
        if (!user) return; //do nothing if no user is logged in

        // Attempt to update the user's first and last name in Supabase - remove leading/trailing spaces with trim()
        const { error } = await supabase
            .from("profiles")
            .update({
                first_name: newFirstName.trim(),
                last_name: newLastName.trim(),
            })
            .eq("id", user.id); // Update the row where the id matches the current user

        // If Supabase returns an error, log it and notify the user
        if (error) {
            console.error("Profile update error:", error.message);
            alert("Failed to update profile.");
        } else {
            // Update was successful — reflect the new name in the UI
            setProfile({
                first_name: newFirstName.trim(),
                last_name: newLastName.trim(),
            });
            setEditingField(null); // Exit edit mode (hide the input fields)
        }
    };

    //Handle company update
    const handleCompanyUpdate = async () => {
        if (!user) return;

        // Attempt to update the user's company field in Supabase - remove leading/trailing spaces with trim()
        const { error } = await supabase
            .from("profiles")
            .update({ company: newCompany.trim() })
            .eq("id", user.id); // Update the row where the id matches the current user

        if (error) {
            alert("Failed to update company: " + error.message);
            return;
        }
        else {
            setCompany(newCompany.trim());
            setEditingField(null); // Close the edit section
        }
    };



    /**
     * Handles updating the user's email address.
     * 
     * 1. Validates that the user is logged in.
     * 2. Ensures new email and confirm email fields are filled and match.
     * 3. Uses Supabase's `updateUser()` to update the email in the `auth.users` table.
     * 4. Triggers an email confirmation flow via `emailRedirectTo`.
     * 5. Shows a success message and clears fields if successful.
     */
    const handleEmailUpdate = async () => {
        // Ensure the user is logged in and both input fields are non-empty
        if (!user || !newEmail.trim() || !confirmEmail.trim()) return;

        // Check if old and new emails are same
        if (newEmail.trim() === email.trim()) {
            setEmailErrorMessage("New email cannot be the same as your current email.")
            return;
        }

        // Check if the two email inputs match
        if (newEmail.trim() !== confirmEmail.trim()) {
            setEmailErrorMessage("Emails do not match.");
            return;
        }

        // Call Supabase's `updateUser()` to initiate the email change process.
        // The `emailRedirectTo` URL is where the user will be redirected after confirming the new email address.
        // Supabase will only finalize the email update after the user clicks the confirmation link.
        const { error } = await supabase.auth.updateUser(
            {
                email: newEmail.trim(), // New email
            },
            {
                emailRedirectTo: `${frontendURL}/login`, // Redirects to login page after email confirmation
            }
        );

        // If there's an error from Supabase, show an alert and log the error
        if (error) {
            console.error("Email update error:", error.message);
            alert("Failed to update email: " + error.message);
        } else {

            setEmailErrorMessage("")

            // Email update initiated successfully
            // User must click the confirmation link sent to their new email.
            // Once confirmed, Supabase will finalize the email change and redirect the user to the login page.
            setEmailUpdateMessage(
                "A confirmation email has been sent to your new email. Please verify it."
            );
        }
    };

    /**
     * @returns Uses the signInWithPassword to check if the current password the user inputs is the one tied to the 
     * account. Then will update the password accordingly.
     */
    const changePassword = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        // Validate current password length
        if (currentPassword && currentPassword.length >= 8) {
            setPassLenErrorCurr(false);
        } else {
            setPassLenErrorCurr(true);
        }

        // Validate new password length
        if (newPassword && newPassword.length >= 8) {
            setPassLenErrorCurr(false);
        } else {
            setPassLenErrorCurr(true);
        }

        // Validate confirmation match
        if (newPassword === confirmPassword) {
            setPasswordConfirmError(false);
        } else {
            setPasswordConfirmError(true);
        }

        // Attempt to verify current password using signInWithPassword
        const { data: _passwordData, error }: AuthResponse = await supabase.auth.signInWithPassword({
            email: email,
            password: currentPassword,
        })

        // error handling
        // If password verification fails, show error and return
        if (error) {
            setWrongPasswordError(true);
            return;
        }

        //If current password is valid, attempt to update the password in Supabase
        const { data: _user, error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        // If update fails, alert the error message
        if (updateError) {
            alert(updateError.message);
            return;
        }

        // Password successfully updated — reset UI state and show confirmation
        alert('Password updated successfully!');
        setEditingField(null);
        setWrongPasswordError(false);
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");

    }


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

        // Do nothing if no file is selected or user is not authenticated
        if (!file || !user) return;

        // Define the storage path: each user's image is stored as 'profile.jpg' under their user ID folder
        const filePath = `${user.id}/profile.jpg`;

        // Upload the file to Supabase Storage with overwrite enabled (upsert: true)
        const { error } = await supabase.storage
            .from('profile-pics')
            .upload(filePath, file, {
                upsert: true, // overwrite if it already exists
            });

        // Show an error message if the upload fails
        if (error) {
            alert("Upload failed: " + error.message);
            return;
        }
        else {
            // Upload succeeded
            setUploadSuccess(true);
            setShowModal(false);// Close the upload modal
            fetchProfileImage(user.id);// Refresh the profile image with the newly uploaded one
        }
    };



    return (
        <div className='flex flex-col justify-center items-center'>

            {/* A tab selector ("Account", "Devices", "E-Waste") that switches views */}
            <div className="w-full flex justify-center mt-6 mb-3">
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

                {/* ACCOUNT TAB: Displays user profile image, name, email, password, and company — all editable */}
                {activeTab === 'Account' && (
                    <div className="w-full max-w-5xl">
                        <div className="w-full flex flex-col md:p-5">
                            <div className="md:p-5">

                                {/* ========== User Profile Header: Image, Name, Email ========== */}
                                <div className="flex items-center gap-4 mb-6">

                                    {/* Circular Profile Image with Edit Button */}
                                    <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-gray-400 bg-gray-200 overflow-visible">
                                        {/* Profile Picture */}
                                        <img
                                            src={profileImageUrl || profilePlaceholder}
                                            alt="Profile Placeholder"
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                        {/* Button to open profile image upload modal */}
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-md"
                                        >
                                            <EditRoundedIcon className="text-gray-700 cursor-pointer" fontSize="small" />
                                        </button>

                                        {/* Profile Picture Upload Modal */}
                                        <ProfileImageUploadModal
                                            isOpen={showModal}
                                            onClose={() => setShowModal(false)}
                                            onUpload={handleUpload}
                                        />
                                    </div>

                                    {/* User's full name and email */}
                                    <div>
                                        <h2 className="text-2xl font-bold text-black">
                                            {profile.first_name} {profile.last_name}
                                        </h2>
                                        <p className="text-lg text-gray-500">{email}</p>
                                    </div>
                                </div>


                                {/* ========== Editable Fields Section ========== */}
                                <div className="border-t pt-4 space-y-4 text-lg">

                                    {/* -------- Name Field -------- */}
                                    <div className="flex flex-col border-b pb-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-black">Name</span>
                                            <div className="flex gap-2 items-center">
                                                <span>{profile.first_name} {profile.last_name}</span>
                                                <EditRoundedIcon
                                                    className="text-gray-500 cursor-pointer"
                                                    fontSize="small"
                                                    onClick={() => {
                                                        if (editingField !== 'name') {
                                                            setNewFirstName(profile.first_name);
                                                            setNewLastName(profile.last_name);
                                                            setEditingField('name');
                                                        } else {
                                                            setEditingField(null);
                                                        }
                                                    }}

                                                />
                                            </div>
                                        </div>

                                        {/* Edit name - last name */}
                                        {editingField === 'name' && (
                                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                                <input
                                                    type="text"
                                                    value={newFirstName}
                                                    onChange={(e) => setNewFirstName(e.target.value)}
                                                    placeholder="First Name"
                                                    className="border border-gray-300 rounded-md p-2 w-full sm:w-1/2"
                                                />
                                                <input
                                                    type="text"
                                                    value={newLastName}
                                                    onChange={(e) => setNewLastName(e.target.value)}
                                                    placeholder="Last Name"
                                                    className="border border-gray-300 rounded-md p-2 w-full sm:w-1/2"
                                                />
                                                <div className="flex gap-2 p-1 justify-end">
                                                    <button
                                                        onClick={() => setEditingField(null)}
                                                        className="rounded-full bg-gray-300 hover:bg-gray-200 text-sm font-semibold py-1 px-4 cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleProfileUpdate}
                                                        className="rounded-full bg-[#2E7D32] text-white hover:brightness-110 text-sm font-semibold py-1 px-4 cursor-pointer"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* -------- Email Field -------- */}
                                    <div className="flex flex-col border-b pb-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-black">Email</span>
                                            <div className="flex gap-2 items-center">
                                                <span>{email}</span>
                                                <EditRoundedIcon
                                                    className="text-gray-500 cursor-pointer"
                                                    fontSize="small"
                                                    onClick={() => setEditingField(editingField === 'email' ? null : 'email')}
                                                />
                                            </div>
                                        </div>

                                        {/* Edit email */}
                                        {editingField === 'email' && (
                                            <div className="flex flex-col gap-3 mt-2">

                                                {/* New Email */}
                                                <input
                                                    type="text"
                                                    placeholder="New Email"
                                                    value={newEmail}
                                                    onChange={(e) => {
                                                        setNewEmail(e.target.value);
                                                        setEmailErrorMessage("");
                                                    }}
                                                    className="border border-gray-300 rounded-md p-2"
                                                />

                                                {/* Confirm Email */}
                                                <input
                                                    type="text"
                                                    placeholder="Confirm New Email"
                                                    value={confirmEmail}
                                                    onChange={(e) => {
                                                        setConfirmEmail(e.target.value);
                                                        setEmailErrorMessage("");
                                                    }}
                                                    className="border border-gray-300 rounded-md p-2"
                                                />
                                                {emailErrorMessage && (
                                                    <p className="text-red-500 text-sm">{emailErrorMessage}</p>
                                                )}

                                                {/* Save & Cancel Buttons */}
                                                <div className="flex gap-3 pt-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingField(null);
                                                            setNewEmail('');
                                                            setConfirmEmail('');
                                                            setEmailUpdateMessage('');
                                                        }}
                                                        className="rounded-full bg-gray-300 hover:bg-gray-200 cursor-pointer text-sm font-semibold py-1 px-4"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleEmailUpdate}
                                                        className="rounded-full bg-[#2E7D32] text-white hover:brightness-110 cursor-pointer text-sm font-semibold py-1 px-4"
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                                {emailUpdateMessage && (
                                                    <p className="text-green-600 text-sm text-center">{emailUpdateMessage}</p>
                                                )}

                                            </div>
                                        )}
                                    </div>

                                    {/* -------- Password Field -------- */}
                                    <div className="flex flex-col border-b pb-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-black">Password</span>
                                            <div className="flex gap-2 items-center">
                                                <span>********</span>
                                                <EditRoundedIcon
                                                    className="text-gray-500 cursor-pointer"
                                                    fontSize="small"
                                                    onClick={() => setEditingField(editingField === 'password' ? null : 'password')}
                                                />
                                            </div>
                                        </div>

                                        {/* Update password */}
                                        {editingField === 'password' && (
                                            <form onSubmit={changePassword} className="flex flex-col gap-3 mt-2">

                                                {/* Current Password */}
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={handleCurrentPasswordChange}
                                                    placeholder="Current Password"
                                                    required
                                                    className="border border-gray-300 rounded-md p-2"
                                                />
                                                {passLenErrorCurr && (
                                                    <p className="text-red-500 text-sm">Password must be at least 8 characters.</p>
                                                )}
                                                {wrongPassword && (
                                                    <p className="text-red-500 text-sm">Incorrect password.</p>
                                                )}

                                                {/* New Password */}
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={handleNewPasswordChange}
                                                    placeholder="New Password"
                                                    required
                                                    className="border border-gray-300 rounded-md p-2"
                                                />
                                                {passLenErrorNew && (
                                                    <p className="text-red-500 text-sm">Password must be at least 8 characters.</p>
                                                )}

                                                {/* Confirm Password */}
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={handleConfirmPasswordChange}
                                                    placeholder="Confirm New Password"
                                                    required
                                                    className="border border-gray-300 rounded-md p-2"
                                                />
                                                {passwordConfirmError && (
                                                    <p className="text-red-500 text-sm">Passwords do not match.</p>
                                                )}

                                                {/* Save & Cancel Buttons */}
                                                <div className="flex gap-3 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingField(null);
                                                            setPassword("");
                                                            setNewPassword("");
                                                            setConfirmPassword("");
                                                            setPassLenErrorCurr(false);
                                                            setPassLenErrorNew(false);
                                                            setWrongPasswordError(false);
                                                            setPasswordConfirmError(false);
                                                        }}
                                                        className="rounded-full bg-gray-300 hover:bg-gray-200 cursor-pointer text-sm font-semibold py-1 px-4"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="rounded-full bg-[#2E7D32] text-white hover:brightness-110 cursor-pointer text-sm font-semibold py-1 px-4"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                    </div>


                                    {/* -------- Company Field -------- */}
                                    <div className="flex flex-col border-b pb-4">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-black">Company</span>
                                            <div className="flex gap-2 items-center">
                                                <span>{company}</span>
                                                <EditRoundedIcon
                                                    className="text-gray-500 cursor-pointer"
                                                    fontSize="small"
                                                    onClick={() => {
                                                        if (editingField === 'company') {
                                                            setEditingField(null);
                                                        } else {
                                                            setNewCompany(company);
                                                            setEditingField('company');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Update company */}
                                        {editingField === 'company' && (
                                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                                <input
                                                    type="text"
                                                    value={newCompany}
                                                    onChange={(e) => setNewCompany(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 bg-white"
                                                />
                                                <div className="flex gap-2 p-1 justify-end">
                                                    <button
                                                        onClick={() => setEditingField(null)}
                                                        className="rounded-full bg-gray-300 hover:bg-gray-200 cursor-pointer text-sm font-semibold py-1 px-4"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleCompanyUpdate}
                                                        className="rounded-full bg-[#2E7D32] text-white hover:brightness-110 cursor-pointer text-sm font-semibold py-1 px-4"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* -------- Account Created Timestamp -------- */}
                                    <div className="flex justify-between border-b pb-4">
                                        <span className="font-semibold text-black">Account Created</span>
                                        <span className="text-gray-400 text-sm">
                                            {user?.created_at ? new Date(user.created_at).toLocaleString() : ''}
                                        </span>
                                    </div>

                                    {/*
                                        - The editable fields are toggled via `editingField` state. Only one can be open at a time.
                                        - Password update logic includes Supabase auth password confirmation.
                                        - Email change requires email confirmation (check handleEmailUpdate).
                                        - Profile image is stored under user ID in Supabase storage as `profile.jpg`.
                                    */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DEVICES TAB: Displays a searchable table of donated devices */}
                {activeTab === 'Devices' && (
                    <div className="w-full">
                        <div className="flex flex-col justify-center mt-4 bg-white md:px-5">

                            {/* -------- Search Bar -------- */}
                            <div className="mb-4">
                                <div className="flex items-center border border-[#989292] rounded-md px-3 py-2 bg-white">

                                    {/* Search icon on the left */}
                                    <SearchIcon className="text-gray-400 mr-2" />

                                    {/* Controlled input updates `searchQuery` state */}
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            setCurrentPage(1); // reset to first page on new search
                                        }}
                                        className="w-full focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* -------- Devices Table -------- */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-[#989292] text-[#4A4949] ">

                                    {/* Table header */}
                                    <thead>
                                        <tr className="border-b border-[#989292]">
                                            <th className="py-2 px-4 font-bold">Device ID</th>
                                            <th className="py-2 px-4 font-bold">Type</th>
                                            <th className="py-2 px-4 font-bold">Model</th>
                                            <th className="py-2 px-4 font-bold">Manufacturer</th>
                                            <th className="py-2 px-4 font-bold">Date Donated</th>
                                        </tr>
                                    </thead>

                                    {/* Table body */}
                                    <tbody>
                                        {/* If no devices, display a message */}
                                        {devices.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center">
                                                    No devices donated yet.
                                                </td>
                                            </tr>
                                        )}
                                        {/* Filter devices based on keyword match in any relevant column */}
                                        {filteredDevices
                                            // Pagination logic: slice devices for current page
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((device, _idx) => (

                                                // Highlight unverified devices in red
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

                            {/* Pagination controls */}
                            <Stack spacing={2} alignItems="center" mt={2}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, page) => setCurrentPage(page)}
                                    shape="rounded"
                                    size="small"
                                    disabled={filteredDevices.length === 0}
                                />
                            </Stack>

                            {/* -------- Legend -------- */}
                            <div className="flex justify-center items-center gap-8 mt-6">

                                {/* Verified devices label */}
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-[#656565]" />
                                    <span className="text-sm text-[#656565]"><strong>Verified</strong></span>
                                </div>

                                {/* Unverified devices label */}
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-0.5 bg-[#B44848]" />
                                    <span className="text-sm text-[#B44848]"><strong>Unverified</strong></span>
                                </div>

                                {/*
                                    - Unverified devices are highlighted in red to alert the user.
                                    - The `verified` field is a boolean that must exist in your Supabase `devices` table.
                                    - The filtering logic matches input against multiple fields including formatted date string.
                                */}
                            </div>
                        </div>
                    </div>
                )}

                {/* E-WASTE TAB: Displays a line chart of emissions and earned badges */}
                {activeTab === 'E-Waste' && (
                    <div className="w-full">

                        {/* -------- Emissions Line Chart Section -------- */}
                        <div className="w-full max-w-5xl bg-white/50 backdrop-blur-md rounded-xl p-6 shadow-sm mb-8 relative">

                            {/* Time Range Dropdown for filtering the data */}
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

                            {/* Section title */}
                            <h2 className="font-semibold">Total Emissions</h2>

                            {/* Chart container */}
                            <Box
                                sx={{
                                    width: '90%',
                                    margin: '0 auto',
                                    position: 'relative',
                                }}
                            >
                                {/* LineChart from MUI X Charts showing emission breakdowns over time */}
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

                                    {/* Custom legend aligned bottom-left of the chart */}
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

                        {/* -------- Badges Section -------- */}
                        <h1 className="text-2xl text-center mb-4 font-bold">Badges</h1>
                        <div className="w-full max-w-5xl flex flex-wrap gap-2 mt-2 justify-center p-6 shadow-sm mb-8 bg-[#D9D9D9] backdrop-blur-md rounded-xl">

                            {/* Display earned badges, if any */}
                            {badges.length > 0 ? (
                                badges.map((badge, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-md text-sm">
                                        {badge.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">No badges earned yet.</p>
                            )}

                            {/*
                                - Emissions data is computed from user's devices and grouped by date in `lineChartUtils.ts`.
                                - Badges are fetched from Supabase using `currentBadges(userId)`.
                                - If adding new metrics update `lineChartUtils` accordingly.
                            */}
                        </div>

                    </div>
                )}
            </div>





        </div >
    );
};

export default UserProfile;

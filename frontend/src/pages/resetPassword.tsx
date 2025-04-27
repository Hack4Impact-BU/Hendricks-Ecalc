import { useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from '../utils/supabase';

function ForgotPassword() {
    const [password, setPassword] = useState<string>('')
    const [confirm, setConfirm] = useState<string>('')
    const [validSession, setValidSession] = useState<boolean>(false)
    // const [visibility, setVisibility] = useState<boolean>(false)

    const navigate = useNavigate()

    // Check for existing user session
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, _session) => {
          if (event == "PASSWORD_RECOVERY") {
            setValidSession(true)
          }
        })
    }, [])

    // Reset password
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        if (!validSession) { // Check if session is valid
            alert('Invalid session. Please request a new password reset email.')
            return
        } 
        else if (password !== confirm) { // Check if passwords match
            alert('Passwords do not match.')
            return
        } 
        else { // reset password if all checks pass
            const { data:_userResponse, error } = await supabase.auth.updateUser({ //call update user function from supabase
                password: password
            })

            // Error handling
            if (error) { 
                console.error('Error updating password:', error.message)
                alert(error.message)
                return
            }

            // Success message
            alert('Password reset successful. Redirecting you to login.')
            setValidSession(false)
            navigate('/login')
        }
    }

    return (
        <>
            <div className='flex justify-center items-center'>
                <div className="flex flex-col w-1/4 p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100 ">
                    <div className="flex flex-col gap-2 mb-4">
                        <h1 className="text-2xl">Reset Your Password</h1>
                        <p>Please enter a new password below.</p>
                    </div>
                    <div className="">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            {/* Form fields */}
                            <div className='flex flex-col gap-1'>   
                                <label className="flex">New password:</label>
                                <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className="flex">Confirm new password:</label>
                                <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                                />
                            </div>
                            <button className="mt-5 border p-2 w-full items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Reset Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
        
    );
}

export default ForgotPassword;
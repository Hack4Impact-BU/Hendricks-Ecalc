import { useState } from 'react';
import supabase from '../utils/supabase';

function ForgotPassword() {
    const [email, setEmail] = useState<string>('')
    // const [visibility, setVisibility] = useState<boolean>(false)

    const frontendURL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, { //call reset password function from supabase
            redirectTo: `${frontendURL}/reset-password`, //temporary reset link
        })

        // Error handling
        if (error) {
            console.error(error.message)
            alert(error.message)
            return
        }

        // Success message
        if (data) {
            console.log('Password reset email sent')
            alert('Password reset email sent. You may close this tab.')
        }
    }

    return (
        <>
            <div className='flex justify-center items-center'>
                <div className="flex flex-col w-1/4 p-10 border border-gray-300 rounded-2xl bg-opacity-10 bg-gray-100 ">
                    <div className="flex flex-col gap-2 mb-4">
                        <h1 className="text-2xl">Forgot your password</h1>
                        <p>Please enter the email associated with your account below.</p>
                    </div>
                    <div className="">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className='flex flex-col gap-1'>   
                                <label className="flex">Email:</label>
                                <input
                                type="text"
                                placeholder="email@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 bg-white"
                                />
                            </div>
                            <button className="mt-5 border p-2 w-full items-center rounded-md bg-green-300 hover:bg-green-200 cursor-pointer active:bg-green-600" type="submit">Send Reset Instructions</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
        
    );
}

export default ForgotPassword;
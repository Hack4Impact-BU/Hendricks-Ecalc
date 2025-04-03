import { useState, useEffect } from 'react';
import axios from 'axios';
import { checkHowLongMember } from '../utils/api';
import { User } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';

// Define interface for props
interface TwoFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
  navigate: NavigateFunction;
}

function TwoFAModal({ isOpen, onClose, userData, navigate }: TwoFAModalProps) {
  const [enteredCode, setCode] = useState('');
  const [invalidError, setInvalidError] = useState(false);
  const [expiredError, setExpiredError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds

  // Start the timer when the modal opens
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isOpen && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setExpiredError(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Clean up timer on unmount or when modal closes
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, timeRemaining]);

  const sendNewCode = async () => {
    if (!userData) return;
    
    setExpiredError(false);
    setTimeRemaining(600);

    // Send 2FA code but don't navigate away - instead show the modal
    await axios.post("http://localhost:3000/api/users/2FA", {
      userEmail: userData.email,
      userId: userData.id
    });

  }

  const handleSubmit = async () => {
    if (!userData) return;
    
    setIsLoading(true);
    setInvalidError(false);
    setExpiredError(false);

    try {
      const response = await axios.post("http://localhost:3000/api/users/verify-2fa", {
        userId: userData.id,
        code: enteredCode
      });
    
      if (response.data.success === true) {
        let userId = userData.id;
        let createdAt = userData.created_at;
        let alertText = await checkHowLongMember(userId, createdAt);
        
        onClose();
        navigate('/welcome', { state: { alertText } });
      } else {
        setInvalidError(true);
      }
    } catch (error) {
      console.error("2FA verification error:", error.response.data.error);

      const currentError = error.response.data.error;

      if (currentError === "expired") {
        setExpiredError(true);
      } else if (currentError === "invalid"){
        setInvalidError(true);
      }
      
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  // Format time remaining as MM:SS with leading zeros
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white mx-4 p-6 rounded-lg shadow-md w-full max-w-xl">
        <div>
          <h2 className="text-4xl font-bold text-center">Verification</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter code sent to email.</p>
        </div>
  
        <input
          type="text"
          placeholder="6-digit code"
          value={enteredCode}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          className="w-full px-4 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className='text-lg text-gray-600 mb-4 text-center'> Code expires in: {formatTimeRemaining()}</p>
  
        {invalidError && (
          <p className="text-red-400 text-sm mb-2 text-center">Invalid code. Please try again.</p>
        )}
  
        {expiredError && (
          <>
            <div className='text-center'>
              <p className="text-red-400 text-sm">Your code has expired. Please try again.</p>
              <span onClick={sendNewCode} className='underline text-red-400 text-sm mb-2 cursor-pointer'> Send a new code!</span>
            </div>
          </>
        )}
  
        <div className="flex items-center justify-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || enteredCode.length !== 6}
            className={`w-3/4 text-white font-semibold py-2 px-10 rounded-full transition duration-200 ${
              isLoading || enteredCode.length !== 6
                ? "bg-[#fff3a5] cursor-not-allowed"
                : "bg-[#FFE017] hover:brightness-105"
            }`}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TwoFAModal;

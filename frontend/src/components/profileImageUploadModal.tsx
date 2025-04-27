import { useState } from 'react';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File) => void;
}

function ProfileImageUploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);

    const handleUploadClick = () => {
        if (file) {
            onUpload(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-black/30 z-50">
            <div className="bg-white mx-4 p-6 rounded-lg shadow-md w-full max-w-xl">
                <h2 className="text-3xl font-bold text-center mb-2">Upload Profile Picture</h2>
                <p className="text-sm text-gray-600 mb-4 text-center">Choose a square image under 5MB.</p>

                <div className="flex justify-center mb-4">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                        <DriveFolderUploadOutlinedIcon className="text-gray-500 text-4xl mb-2" />
                        <span className="text-sm text-gray-600">Click to upload profile picture</span>
                        <input
                            type="file"
                            accept="image/jpeg" // allow only jpeg/jpg 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        {file && (
                            <div className="flex justify-center mt-4">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Selected preview"
                                    className="w-24 h-24 object-cover rounded-full border border-gray-300"
                                />
                            </div>
                        )}

                    </label>

                </div>

                <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                        onClick={onClose}
                        className="w-1/2 cursor-pointer rounded-full bg-gray-300 hover:bg-gray-200 text-sm font-semibold py-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUploadClick}
                        disabled={!file}
                        className={`w-1/2 text-white font-semibold py-2 px-10 rounded-full transition duration-200 ${!file ? 'bg-[#fff3a5] cursor-not-allowed' : 'bg-[#FFE017] hover:brightness-105 cursor-pointer'
                            }`}
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileImageUploadModal;

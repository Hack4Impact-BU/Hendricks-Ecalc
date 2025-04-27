import React, { useState } from 'react';
import { ExtractTextFromImage } from '../utils/api';
import { Base64Convert } from '../utils/base64Img';

function OcrUpload() {
  const [currentImage, setImage] = useState<File | null>(null);
  const [manufacturer, setManufacturer] = useState<string>('');
  const [processedText, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setText('');
    }
  };

  const handleSubmit = async () => {
    if (!currentImage || !manufacturer) {
      alert("Please upload an image and specify the manufacturer.");
      return;
    }

    setIsProcessing(true);
    try {
      const base64String = await Base64Convert(currentImage);
      const extractedText = await ExtractTextFromImage(base64String, manufacturer);
      setText(extractedText);
    } catch (error) {
      console.error("Error processing image:", error);
      setText("Error processing image.");
    }
    setIsProcessing(false);
  };

  return (
    <div className='w-full items-center justify-center'>
      <div className='m-4'>
        <div className='max-w-4xl m-auto text-center'>
          <h2 className='text-2xl font-bold'>Upload Serial Number Image</h2>

          <div className='m-5 space-y-4'>
            <label className='block'>
              <span>Select Manufacturer:</span>
              <select
                className='mt-1 p-2 rounded-xl border border-gray-300'
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              >
                <option value="">-- Select --</option>
                <option value="Apple">Apple</option>
                <option value="Acer">Acer</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Dell">Dell</option>
                <option value="HP">HP</option>
                <option value="Asus">Asus</option>
                <option value="Microsoft">Microsoft</option>
              </select>
            </label>

            <label htmlFor="files" className='bg-slate-100 p-2 rounded-2xl text-md hover:cursor-pointer inline-block'>
              Select Image
            </label>
            <input
              id="files"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {currentImage && (
              <div className='flex justify-center items-center my-5'>
                <img
                  src={URL.createObjectURL(currentImage)}
                  alt={currentImage.name}
                  className='max-w-[300px] border-2 rounded-2xl'
                />
              </div>
            )}

            <button
              className='bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 disabled:bg-gray-400'
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Submit'}
            </button>

            {processedText && (
              <div className='mt-6'>
                <h3 className='text-3xl mb-2'>Recognized Text:</h3>
                <p>{processedText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OcrUpload;

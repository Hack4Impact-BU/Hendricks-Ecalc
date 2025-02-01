import React, { useState } from 'react';

import { ExtractTextFromImage } from '../utils/apis'
import { Base64Convert } from '../utils/base64Img'

import Loading from '../components/loading';

/*
* This component uses google cloud OCR to extract the serial number from a computer
*/

function OcrUpload() {

  /**
   * @currentImage is the image the user has uploaded
   * @processedText is the text that is returned from the api call
   * @isProcessing just to indicate to the user when something is loading
   */
  
  const [currentImage, setImage] = useState<File | null>(null);
  const [processedText, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Takes in an image then sends an API request to process it through google OCR
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files) {
      return
    }

    const currentFile = e.target.files[0];
    setImage(currentFile);
    setText('');
    setIsProcessing(true);

    try {

      const base64String = await Base64Convert(currentFile);
      const extractedText = await ExtractTextFromImage(base64String);
      setText(extractedText);

    } catch (error) {

      console.error("Error processing image:", error);
      setText("Error processing image.");

    }

    setIsProcessing(false);

  };

  return (
    <div>
      <div className='w-full items-center justify-center'>
        <div className='m-4'>
          <div className='max-w-4xl m-auto text-center'>
            <h2>Please upload picture of device serial number</h2>
            <div className='m-5'>
              <label htmlFor="files" className='bg-slate-100 p-2 rounded-2xl text-md hover:cursor-pointer'>Select Image</label>
              <input
                id="files"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {currentImage && (
              <div className='flex justify-center items-center my-5'>
                <img
                  src={URL.createObjectURL(currentImage)}
                  alt={currentImage.name}
                  className='max-w-[300px] border-2 rounded-2xl'
                />
              </div>
            )}
            
            <div>
              <h3 className='text-3xl mb-4'>Recognized Text:</h3>
              
              <div className={`${isProcessing ? 'block' : 'hidden'}`}> 
                <Loading /> 
              </div>

              {processedText && (
                <>
                  <div>
                    <p>{processedText}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OcrUpload;

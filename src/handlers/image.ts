import { Request, Response } from "express";
import vision from "@google-cloud/vision"

import {ImageProcessing} from "../dtos/ImageProcessing.dto"

// Parse the string from the env var into a JSON object
const keyObject = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);

// Initialize the client for the google cloud vision
const client = new vision.ImageAnnotatorClient({
  credentials: keyObject
})

/** 
 * @deviceManufacturer what is used to identify what pattern to pick
 * @text what the ocr has recognized from the picture
 * 
 * Extracts serial numbers using regex patterns specific to each manufacturer.
*/
const extractSerialNumbers = async (deviceManufacturer:string, text: string): Promise<string> => {
  const patterns = [
    { manufacturer: "Apple", 
      regex: /(?:Serial(?:\s+No\.?|No\.?| Number)?:?\s*)([A-Z0-9]{10,14})/i,
      fallback: /\b[A-Z0-9]{10,12}\b/ },
    { manufacturer: "Acer", 
      regex: /(?:S\/N:?\s*)([A-Z0-9]{22})|(?:SNID:?\s*)(\d{11})/i,
      fallback: /\b[A-Z0-9]{22}\b|\b\d{11}\b/i},
    { manufacturer: "Lenovo", regex: /\b[A-Z0-9]{8,10}\b/ },
    { manufacturer: "Dell", regex: /\b[A-Z0-9]{7}\b/ },  // Example for Dell
    { manufacturer: "HP", regex: /\b[A-Z0-9]{10,12}\b/ },
    { manufacturer: "Asus", regex: /\b[A-Z0-9]{12,15}\b/ },
    { manufacturer: "Microsoft", regex: /\b\d{12}\b/ }, // Surface devices
  ];
  
  const findCompany = patterns.find(company => company.manufacturer.toLowerCase() === deviceManufacturer.toLowerCase());
  
  if (findCompany) {
    const testSerial = text.match(findCompany.regex);
    if (testSerial) {
      return testSerial[1]; //Extracting only serial number
    }
    
    // If no match, use fallback (if available)
    if (findCompany.fallback) {
      const fallbackMatch = text.match(findCompany.fallback);
      if (fallbackMatch) {
        return fallbackMatch[0];  // Extract only the serial number from fallback
      }
    }
  }

  return text;

};

/* 
* This function uses google OCR to detect text on the image that is passed in
* The image should be in Base64 and without the header
* You also need to make sure you have the json key for the google vision api
*/
const processImage = async (req:Request, res:Response): Promise<void> => {
  try {

    console.log("start")
    const { imageBase64, manufacture }:ImageProcessing  = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "No image provided" });
    }

    console.log("OCR")
    // Perform OCR using Google Vision
    const [result] = await client.textDetection({ image: { content: imageBase64 } });

    console.log("OCR DONE")
    // Use ?? to fall back to an empty array if the results are null
    // The results is an array of objects
    const textAnnotations = result.textAnnotations ?? [];

    console.log("TEXT DONE")
    // The first index of the array is an object that has the full description of the text
    // So if there is a length that is greater than 0 there is text else there is none
    const extractedText = textAnnotations.length > 0 ? textAnnotations[0].description as string : "No text found";

    // Pass in the manufacture and text from the OCR
    const computerSerialNumber = await extractSerialNumbers(manufacture,extractedText);
    console.log("EXTRACT DONE")
    // Then send the response to the frontend
    res.json({ text: computerSerialNumber });

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "OCR processing failed" });
  }
}

export { processImage }
import { Request, Response } from "express";
import path from "node:path"
import vision from "@google-cloud/vision"

import {ImageProcessing} from "../dtos/ImageProcessing.dto"

const service:string = path.join('service-account-g.json');

// Initialize the client for the google cloud vision
const client = new vision.ImageAnnotatorClient({
  keyFilename: service
})

/* 
* This function uses google OCR to detect text on the image that is passed in
* The image should be in Base64 and without the header
* You also need to make sure you have the json key for the google vision api
*/
const processImage = async (req:Request, res:Response): Promise<void> => {
  try {

    const { imageBase64 }:ImageProcessing  = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "No image provided" });
    }

    // Perform OCR using Google Vision
    const [result] = await client.textDetection({ image: { content: imageBase64 } });

    // Use ?? to fall back to an empty array if the results are null
    // The results is an array of objects
    const textAnnotations = result.textAnnotations ?? [];

    // The first index of the array is an object that has the full description of the text
    // So if there is a length that is greater than 0 there is text else there is none
    const extractedText = textAnnotations.length > 0 ? textAnnotations[0].description : "No text found";

    // Then send the response to the frontend
    res.json({ text: extractedText });

  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "OCR processing failed" });
  }
}

export { processImage }
import axios from "axios";

/**
 * Call api from the backend to extract the text from the object
 * 
 * @param imageBase64 takes the base64 of the image the user has uploaded
 * @returns the text from that image
 */

export const ExtractTextFromImage = async (imageBase64: string) => {
  try {
    const response = await axios.post("http://localhost:3000/api/image-processing/ocr", {
      imageBase64,
    });

    return response.data.text;
  } catch (error) {
    console.error("Error fetching OCR results:", error);
    return "OCR failed";
  }
};


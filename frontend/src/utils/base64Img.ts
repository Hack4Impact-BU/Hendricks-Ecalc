
/**
 * Converts the image to base64 for the google ocr
 * Using the File Web API to use the FileReader interface
 * 
 * @param imageFile which takes in the image File the user has uploaded
 * @returns The base64 of that file
 */

export const Base64Convert = (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      let reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        if (!base64Data) reject("Base64 conversion failed");
        resolve(base64Data);
      };

      reader.onerror = () => {
        reject("Error reading file");
      };

      reader.readAsDataURL(imageFile); // Starts reading
    } catch (error) {
      reject("Base64 conversion failed");
    }
  });
};

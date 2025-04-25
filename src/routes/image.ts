import { Router } from "express";
import { processImage } from "../handlers/image"

const router = Router();

// post route to process the image using google ocr
router.post('/ocr', processImage)

export default router;
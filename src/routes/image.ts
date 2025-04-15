import { Router } from "express";
import { processImage } from "../handlers/image"

const router = Router();

router.post('/ocr', processImage)

export default router;
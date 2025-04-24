import { Router } from "express";
import { send2FACode, check2FACode, SendContactEmail } from "../handlers/users";

const router = Router();

// Send the email code to the corresponding user
router.post('/2FA', send2FACode);
router.post('/verify-2fa', check2FACode);

// Send the contact info from the form to email
router.post('/send-contact', SendContactEmail);

export default router;
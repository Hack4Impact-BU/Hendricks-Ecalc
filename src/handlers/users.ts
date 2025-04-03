import { Request, Response } from "express";
import resend from "../utils/resend";
import supabase from "../utils/supabase";

import { User2FASend, User2FACheck } from "../dtos/UserEmail.dto";

export function getUsers(req:Request, res:Response) {
  res.send('wow the route works for getUsers!')
}

export function getUserById(req:Request, res:Response) {
  res.send('wow the route works for getUserById!')
}

export async function send2FACode (req:Request, res:Response): Promise<void> {
  try {
    console.log("/2FA route hit");

    // Get the user email and id from the json body
    const { userEmail, userId }: User2FASend = req.body;

    // Generates a number from 100000 to 999999
    const userCode = Math.floor(100000 + Math.random() * 900000);

    // Add a check here to see if there is a code already and if the time limit is up

    // If the time limit is up then delete the row and insert a new code

    // Inserting the code into the 2fa codes table
    const { error:insertError } = await supabase
    .from("2fa_codes")
    .insert({
      id: userId,
      current_code: userCode
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      res.status(500).json({ error: "Database error" });
      return;
    }

    // Send the code to the users email
    const { error:emailError } = await resend.emails.send({
      from: 'Hendricks Foundation <no-reply@jordany.xyz>',
      to: userEmail,
      subject: 'Your 2FA Code!',
      html: `<strong>Here is your 2FA code: </strong> ${userCode}`,
    });
  
    if (emailError) {
      console.error("Email sending error:", emailError);
      res.status(500).json({ error: "Email Service error" });
      return;
    }

    res.status(200).json({ success: true });
    return;
  } catch (error) {
    console.error("Error in send2FACode:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function check2FACode (req:Request, res:Response): Promise<void> {
  try {
    console.log("Starting check")
    const { userId, code }:User2FACheck = req.body;

    const { data:codeData , error:codeError } = await supabase
    .from("2fa_codes")
    .select("current_code, created_at")
    .eq("id", userId)
    .single();

    console.log(codeData);

    if (codeError || !codeData) {
      res.status(404).json({ success: false, error: "Code not found." });
      return;
    }

    const isExpired = Date.now() - new Date(codeData.created_at).getTime() > 10 * 60 * 1000;

    if (isExpired) {
      await supabase.from("2fa_codes").delete().eq("id", userId);
      res.status(401).json({ success: false, error: "expired" });
      return;
    }

    if (codeData.current_code !== code.trim()) {
      res.status(401).json({ success: false, error: "invalid" });
      return;
    }

    // Optional: delete the used code
    await supabase.from("2fa_codes").delete().eq("id", userId);

    res.status(200).json({ success: true });
    return ;

  } catch (error) {
    console.log(error);
  }
}
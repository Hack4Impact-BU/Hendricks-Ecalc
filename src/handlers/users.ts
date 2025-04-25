import { Request, Response } from "express";
import resend from "../utils/resend";
import supabase from "../utils/supabase";

import { User2FASend, User2FACheck } from "../dtos/UserEmail.dto";
import { ContactSend } from "../dtos/ContactForm.dto";

// This function sends the 2FA code using resend.
export async function send2FACode (req:Request, res:Response): Promise<void> {
  try {
    console.log("/2FA route hit");

    // Get the user email and id from the json body which is defined by the DTOS
    const { userEmail, userId }: User2FASend = req.body;

    // Generates a number from 100000 to 999999
    const userCode = Math.floor(100000 + Math.random() * 900000);

    // Add a check here to see if there is a code already and if the time limit is up
    const { data:codeData , error:codeError } = await supabase
    .from("2fa_codes")
    .select("current_code, created_at")
    .eq("id", userId)
    .single();

    // If we get a row then we know there was a code that was already sent
    if (codeData){
      const createdAt = new Date(codeData.created_at);
      const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
      const isExpired = Date.now() > expiresAt.getTime();

      // If its expired then delete the code and respond with the code is invalid
      if (isExpired) {
        await supabase.from("2fa_codes").delete().eq("id", userId);
        res.status(401).json({ success: false, error: "expired" });
        return;
      }

      // Otherwise if the code is not expired then send send back when the code will expire to display to the user
      res.status(200).json({ success: true, expires_at: expiresAt.toISOString()});
      return;
    }

    // If there isn't any row then we insert the code into the 2fa codes table
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

    // Send the code to the users email using resend
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

    // Then set the expiration time and send it to the frontend
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    res.status(200).json({ success: true, expires_at: expiresAt.toISOString()});
    return;
  } catch (error) {
    console.error("Error in send2FACode:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Check the 2FA code 
export async function check2FACode (req:Request, res:Response): Promise<void> {
  try {
    
    // get the userId and code which is define by the DTOS
    const { userId, code }:User2FACheck = req.body;

    // Fetch the code for the current user
    const { data:codeData , error:codeError } = await supabase
    .from("2fa_codes")
    .select("current_code, created_at")
    .eq("id", userId)
    .single();

    // Error checking to see if the code was found
    if (codeError || !codeData) {
      res.status(404).json({ success: false, error: "Code not found." });
      return;
    }

    // See if the code is expired
    const isExpired = Date.now() - new Date(codeData.created_at).getTime() > 10 * 60 * 1000;

    // If its expired then delete the code and tell invalid
    if (isExpired) {
      await supabase.from("2fa_codes").delete().eq("id", userId);
      res.status(401).json({ success: false, error: "expired" });
      return;
    }

    // If its not the right code then invalid
    if (codeData.current_code !== code.trim()) {
      res.status(401).json({ success: false, error: "invalid" });
      return;
    }

    // Delete the used code
    await supabase.from("2fa_codes").delete().eq("id", userId);

    const { error: updateError } = await supabase
    .from("profiles")
    .update({ two_fa_verified: true })
    .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile for 2FA:", updateError);
      res.status(500).json({ success: false, error: "Failed to update 2FA status" });
      return
    }

    res.status(200).json({ success: true });
    return ;

  } catch (error) {
    console.log(error);
  }
}

// Sending the email using the contact form info
export async function SendContactEmail(req:Request, res:Response): Promise<void> {
  try {
    const { name, email, subject, message }:ContactSend = req.body;

    // Send the email with data from the contact form
    // Determine who you want to send the email to
    const { error: emailError } = await resend.emails.send({
      from: 'Hendricks Foundation <no-reply@jordany.xyz>',
      to: 'jordan.chea3@gmail.com',
      subject: subject,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    if (emailError) {
      console.error(emailError);
      res.status(500).json({ success: false, message: 'Email failed to send.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Email sent successfully.' });
    return;
  } catch (error) {
    console.log(error)
  }
}
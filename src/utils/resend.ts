import { Resend } from 'resend';

// Check if the RESEND_API_KEY is in the .env file. If not then backend won't run.
if(!process.env.RESEND_API_KEY){
  throw new Error("No RESEND_API_KEY currently defined in .env file")
}

// Instantiate a new Resend client using the API key from the environment.
// Will be used to send emails
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
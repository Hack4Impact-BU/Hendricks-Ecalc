import { Resend } from 'resend';

if(!process.env.RESEND_API_KEY){
  throw new Error("No RESEND_API_KEY currently defined in .env file")
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
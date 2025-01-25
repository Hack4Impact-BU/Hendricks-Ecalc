import express, { Request, Response } from 'express';
import dotenv from 'dotenv'
import userRouter from './routes/users';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.get('/', (req:Request, res:Response) => {
  res.send('Express + Typescript Test')
});

app.use('/api/users', userRouter);

app.listen(PORT, () => {
  console.log(`Running On Port ${PORT}`)
});
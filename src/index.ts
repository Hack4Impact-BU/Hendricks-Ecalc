import dotenv from 'dotenv'
dotenv.config();

import express, { Request, Response } from 'express';
import cors from "cors"

import userRouter from './routes/users';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use cors setup so the frontend can make a request to the backend
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.get('/', (req:Request, res:Response) => {
  res.send('Express + Typescript Test')
});

// This is just a test route
app.use('/api/users', userRouter);

app.listen(PORT, () => {
  console.log(`Running On Port ${PORT}`)
});
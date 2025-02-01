import express, { Request, Response } from 'express';
import cors from "cors"
import dotenv from 'dotenv'

import userRouter from './routes/users';
import imageRouter from './routes/image';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Use cors setup so the frontend can make a request to the backend
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

// Original limit for express json body parser is 100KB so made it 10mb
app.use(express.json({ limit: "10mb" }));

app.get('/', (req:Request, res:Response) => {
  res.send('Express + Typescript Test')
});

// This is just a test route
app.use('/api/users', userRouter);

// The route used for the image processing
app.use('/api/image-processing', imageRouter)

app.listen(PORT, () => {
  console.log(`Running On Port ${PORT}`)
});
import dotenv from 'dotenv'
dotenv.config();

import express, { Request, Response } from 'express';
import cors from "cors"

import userRouter from './routes/users';
import imageRouter from './routes/image';

const app = express();
const PORT = process.env.PORT || 3000;

// Original limit for express json body parser is 100KB so made it 10mb
app.use(express.json({ limit: "10mb" }));

// Use cors setup so the frontend can make a request to the backend
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.get('/', (req:Request, res:Response) => {
  res.send('The backend is responsive!')
});

// User route
app.use('/api/users', userRouter);

// The route used for the image processing
app.use('/api/image-processing', imageRouter)

app.listen(PORT, () => {
  console.log(`Running On Port ${PORT}`)
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

//routes
import { loginRouter } from './src/routes/login';
import { registerRouter } from './src/routes/register';
import { verifyOTPRouter } from './src/routes/verifyotp';
import { startRouter } from './src/routes/start';

// dotenv.config();
const app = express();

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const serviceAccountKey = require("./serviceAccountKey.json")

//initialize firebase
initializeApp({
    credential: credential.cert(serviceAccountKey)
});


mongoose.connect(process.env.MONGO_URL as string)
.then(() => console.log("Connected to MongoDB..."))
.catch((err: Error) => console.log("Failed to connect to MongoDB with error: " + err));

app.use(express.json());
app.use(cors());

//using the routes
app.use("/api/v1/login", loginRouter);
app.use("/api/v1/register", registerRouter);
app.use("/api/v1/verifyotp", verifyOTPRouter)
app.use("/api/v1/start", startRouter);


//opening the port
app.listen(process.env.PORT, () => {
    console.log('Server listening on port: ' + process.env.PORT);
})
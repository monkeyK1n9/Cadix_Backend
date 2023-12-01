import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

//routes
import { loginRouter } from './src/routes/login';
import { registerRouter } from './src/routes/register';
import { startRouter } from './src/routes/start';

dotenv.config();
const app = express();

const port = 8800;

dotenv.config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTypology: true,
})
.then(() => console.log("Connected to MongoDB..."))
.catch((err: Error) => console.log("Failed to connect to MongoDB with error: " + err));

app.use(express.json());
app.use(cors());

//using the routes
app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/start", startRouter);


//opening the port
app.listen(port, () => {
    console.log('Server listening on port: ' + port);
})
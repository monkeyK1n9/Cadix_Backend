const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const port = 8800;

//routes


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
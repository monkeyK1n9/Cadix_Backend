import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

//socket handlers
import { sendMessage } from './src/handlers/messages';

//routes
import { loginRouter } from './src/routes/login';
import { registerRouter } from './src/routes/register';
import { forgotPasswordRouter } from './src/routes/forgotpassword';
import { resetPasswordRouter } from './src/routes/resetpassword';
import { userRouter } from './src/routes/user';
import { verifyOTPRouter } from './src/routes/verifyotp';
import { startRouter } from './src/routes/start';
import { versionsRouter } from './src/routes/versions';
import { teamsRouter } from './src/routes/teams';
import { messagesRouter } from './src/routes/messages';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.CLIENT_URL
    }
});

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
app.use("/api/v1/forgotpassword", forgotPasswordRouter);
app.use("/api/v1/resetpassword", resetPasswordRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/verifyotp", verifyOTPRouter);
app.use("/api/v1/start", startRouter);
app.use("/api/v1/versions", versionsRouter);
app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/messages", messagesRouter);


//using sockets middlewares
io.use((socket: Socket<DefaultEventsMap, any>, next: any) => {
    // TODO: implement socket middlewares
    next();
})

//connecting sockets
io.on('connection', (socket) => {
    console.log(`User connected with id: ${socket.id}`);
    socket.on("send_message", sendMessage);

    socket.emit("receive_message", async(message: any) => {

    })
});


//opening the port
server.listen(process.env.PORT, () => {
    console.log('Server listening on port: ' + process.env.PORT);
})
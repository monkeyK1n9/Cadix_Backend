"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("firebase-admin/app");
const firebase_admin_1 = require("firebase-admin");
//socket handlers
const messages_1 = require("./src/handlers/messages");
//routes
const login_1 = require("./src/routes/login");
const register_1 = require("./src/routes/register");
const forgotpassword_1 = require("./src/routes/forgotpassword");
const resetpassword_1 = require("./src/routes/resetpassword");
const user_1 = require("./src/routes/user");
const verifyotp_1 = require("./src/routes/verifyotp");
const start_1 = require("./src/routes/start");
const versions_1 = require("./src/routes/versions");
const teams_1 = require("./src/routes/teams");
const messages_2 = require("./src/routes/messages");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.CLIENT_URL
    }
});
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const serviceAccountKey = require("./serviceAccountKey.json");
//initialize firebase
(0, app_1.initializeApp)({
    credential: firebase_admin_1.credential.cert(serviceAccountKey)
});
mongoose_1.default.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.log("Failed to connect to MongoDB with error: " + err));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//using the routes
app.use("/api/v1/login", login_1.loginRouter);
app.use("/api/v1/register", register_1.registerRouter);
app.use("/api/v1/forgotpassword", forgotpassword_1.forgotPasswordRouter);
app.use("/api/v1/resetpassword", resetpassword_1.resetPasswordRouter);
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/verifyotp", verifyotp_1.verifyOTPRouter);
app.use("/api/v1/start", start_1.startRouter);
app.use("/api/v1/versions", versions_1.versionsRouter);
app.use("/api/v1/teams", teams_1.teamsRouter);
app.use("/api/v1/messages", messages_2.messagesRouter);
//using sockets middlewares
io.use((socket, next) => {
    // TODO: implement socket middlewares
    next();
});
// registering socket callbacks
const onConnection = (socket) => {
    console.log(`User connected with id: ${socket.id}`);
    (0, messages_1.joinRoom)(io, socket);
    (0, messages_1.sendMessage)(io, socket);
    // receiveMessage(io, socket);
};
//connecting sockets
io.on('connection', onConnection);
//opening the port
server.listen(process.env.PORT, () => {
    console.log('Server listening on port: ' + process.env.PORT);
});

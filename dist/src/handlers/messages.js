"use strict";
// we create handlers for socker io
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.joinRoom = void 0;
function joinRoom(io, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        socket.on("join_room", (data) => {
            const { projectTeamId } = data;
            socket.join(projectTeamId);
        });
    });
}
exports.joinRoom = joinRoom;
function sendMessage(io, socket) {
    return __awaiter(this, void 0, void 0, function* () {
        socket.on("send_message", (data) => {
            const { projectTeamId, message } = data;
            //the projectTeamId will be the name of the chat room
            socket.to(projectTeamId).emit("receive_message", message);
        });
    });
}
exports.sendMessage = sendMessage;
// export async function receiveMessage(
//     io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
//     socket: Socket<DefaultEventsMap, any>
// ) {
//     socket.emit("receive_message", (data: any) => {
//         const { projectTeamId, message } = data;
//         socket.to(projectTeamId).emit("receive_message", message);
//     });
// }

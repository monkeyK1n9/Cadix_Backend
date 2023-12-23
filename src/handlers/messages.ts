// we create handlers for socker io

import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export async function sendMessage(data: any, socket: Socket<DefaultEventsMap, any>) {
    const { projectTeamId, message } = data;

    //the projectTeamId will be the name of the chat room
    socket.to(projectTeamId).emit("receive_message", message);
}

export async function receiveMessage() {

}

export async function sendNotification() {
    
}
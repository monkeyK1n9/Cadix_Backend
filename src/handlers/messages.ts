// we create handlers for socker io

import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export async function joinRoom(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, any>
) {
    socket.on("join_room", (data: any) => {
        const { projectTeamId } = data;
        socket.join(projectTeamId);
    });
}

export async function sendMessage(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, any>
) {
    socket.on("send_message", (data: any) => {
        const { projectTeamId, message } = data;
    
        //the projectTeamId will be the name of the chat room
        socket.to(projectTeamId).emit("receive_message", message);
    });
}

export async function receiveMessage(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    socket: Socket<DefaultEventsMap, any>
) {
    socket.emit("receive_message", (data: any) => {
        const { projectTeamId, message } = data;

    });

}
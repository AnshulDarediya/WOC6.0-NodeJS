import express from "express";
import {createServer} from "http";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Server } from 'socket.io';
import { Socket } from "dgram";

const __dirname = dirname(fileURLToPath(import.meta.url));


//NameForSocketID will store User_Name of a user with particular Socket ID;
var NameForSocketID=new Map();

//RoomForSocketID will store the room_code of a user which he/she is in with particular SocketID;
var RoomForSocketID=new Map();

//RoomSocketIDs will keep track of All socketIDs in a Room
var RoomSocketIDs= new Map() ;  

var RoomHost=new Set();

//Global Variable User_Name and Room_Code are used in General
var User_Name="",Room_Code="";

const app = express();
const port = 3000;
const server=createServer(app);
const io = new Server(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/", (req, res) => {
    if (req.body.createUsername) {
        // Handle create room request
        const username = req.body.createUsername;
        User_Name=username;
        if (username.trim() !== "") {
            res.sendFile(__dirname + "/public/index2.html");
        } else {
            res.status(400).send("Invalid username");
        }
    } else {
        // Handle join room request
        const username = req.body.joinUsername;
        const roomCode = req.body.roomCodeInput;
        User_Name=username;
        Room_Code=roomCode;
        if (username.trim() !== "" && RoomSocketIDs.has(Room_Code) ) {
            res.sendFile(__dirname + "/public/index2.html");
        } else {
            res.status(400).send("Invalid room code");
        }
    }
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


  
io.on('connection', (socket) => {
    
    if(Room_Code==""){
        Room_Code=generateRandomString(5);
        while(RoomSocketIDs.has(Room_Code)) Room_Code=generateRandomString(5);
        var temp=new Set();
        RoomSocketIDs.set(Room_Code,temp);
        RoomHost.add(socket.id);
    } 
    
    // Maping NameForSocketID -->(socket.id, User_Name) and RoomForSocketID -->(socket.id,Room_code)
    NameForSocketID.set(socket.id,User_Name);
    RoomForSocketID.set(socket.id,Room_Code);
    RoomSocketIDs.get(Room_Code).add(socket);
    
    //Resetting User_Name and Room_Code for reuse
    User_Name="";
    Room_Code="";
    
    //Joining These Socket id to a room with Room_Code (We Can Get these Using Map)
    socket.join(RoomForSocketID.get(socket.id));

    //Sending Room Code To Client to display it on Screen
    io.to(socket.id).emit('room-code-to-client',RoomForSocketID.get(socket.id));

    //Sending User_Name of user just joined in these room to all the members of Room
    io.to(RoomForSocketID.get(socket.id)).emit('userName_to_client_joined',NameForSocketID.get(socket.id));
   
    console.log('a user connected '  + socket.id);

    //handle When a Client Disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        if(RoomHost.has(socket.id)) FireUserJoined(socket);
        LeaveRoomUpdate(socket);
    });

    socket.on("leave-room", (roomCode) => {
        if(RoomHost.has(socket.id)) FireUserJoined(socket);
        socket.leave(RoomForSocketID.get(socket.id));
        console.log(`User left room: ${NameForSocketID.get(socket.id)}`);
        LeaveRoomUpdate(socket);
    });
    
    //Handle a msg from Client
    socket.on('msg_from_client',(msg)=>{
        const mssg = NameForSocketID.get(socket.id) + ' : ' + msg;
        console.log('message: ' + msg);
        //send a msg came from a user to a particular room which he/she is in.
        io.to(RoomForSocketID.get(socket.id)).emit('msg_to_all_client',mssg);
    });

});



function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}
function FireUserJoined(socket){
    var rmCode=RoomForSocketID.get(socket.id);
    RoomHost.delete(socket.id);
    // console.log(`User left room: ${NameForSocketID.get(socket.id)}`);
    for(const skt of RoomSocketIDs.get(rmCode).values()){ 
        if(skt===socket) continue;
        io.to(skt.id).emit('redirectToHome');
        LeaveRoom(skt);
    }
    RoomSocketIDs.delete(rmCode);
}
function LeaveRoom(socket){
    socket.leave(RoomForSocketID.get(socket.id));
    console.log(`User left room: ${NameForSocketID.get(socket.id)}`);
    LeaveRoomUpdate(socket);
}
function LeaveRoomUpdate(socket){
        
    //Sending User_Name of user just disconnected in these room to all the members of Room
        io.to(RoomForSocketID.get(socket.id)).emit('userName_to_client_disconnected',NameForSocketID.get(socket.id));
        
        //updating Map of NameForSocketID and RoomUserCount
        NameForSocketID.delete(NameForSocketID.get(socket.id));

        //updating map of RoomForSocketID
        RoomForSocketID.delete(socket.id);
}

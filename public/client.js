document.addEventListener('DOMContentLoaded', function () {

  const socket = io();

  const MessageFromClient = document.getElementById("message-text");
  const SendMessageButton = document.getElementById("send-message");
  const messages = document.getElementById("chat-messages");
  const userList = document.getElementById("user-list-items");
  const roomCode = document.getElementById("room-code-value");
  const leaveRoomButton = document.getElementById('leave-room');

  socket.on('redirectToHome',  () => {
    // redirect to new URL
    console.log("Home");
    alert("The Host of the Room Got Disconnected !! Thus all the member's of the room got Disconnected");
    window.location.href = "/";
  });

  socket.on("userName_to_client_joined", (msg) => {
    const item = document.createElement("p");
    item.textContent = msg + " joined";
    userList.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
  socket.on("userName_to_client_disconnected", (msg) => {
    const item = document.createElement("p");
    item.textContent = msg + " disconnected";
    userList.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on("msg_to_all_client", (msg) => {
    console.log(msg);
    const item = document.createElement("li");
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });

  socket.on("room-code-to-client", (rm_code) => {
    console.log(rm_code);
    const item = document.createElement("p");
    item.innerText = rm_code;
    roomCode.appendChild(item);
  });

  SendMessageButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (MessageFromClient.value) {
      socket.emit("msg_from_client", MessageFromClient.value);
      // console.log(MessageFromClient.value);
      MessageFromClient.value = "";
    }
  });

  leaveRoomButton.addEventListener('click', function () {
    // Emit the leave-room event to notify the server
    socket.emit('leave-room');

    // Redirect to the create room and join room page
    window.location.href = "/"; 
});


});

import WebSocket, {WebSocketServer} from 'ws';
import {Pin} from "./types/Pin";
import {Message} from "./types/Message";
import {v4 as uuidv4} from "uuid";

const wss = new WebSocketServer({port: 8080});
const serverId = 'server';
const clients: Map<string, WebSocket> = new Map();
const pins: Pin[] = [];

wss.on('connection', function connection(ws) {
  initializedClient(ws);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const message: Message = JSON.parse(data.toString());
    console.log(message);
    switch (message.type) {
      case "addPin":
        addPin(message);
        break;
      case "deletePin":
        deletePin(message);
        break;
      case "updatePin":
        updatePin(message);
        break;
    }
  });
});

const initializedClient= (ws: WebSocket) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  const message: Message = {
    senderId: serverId,
    clientId: clientId,
    type: "initialization",
    pins: pins
  }

  console.log(`new client connected with id: ${clientId}`);
  ws.send(JSON.stringify(message));
}

const addPin = (message: Message)=> {
  if (!message.pin) {
    return;
  }
  const pin: Pin = message.pin;
  pins.push(pin);
  sendMessageToOtherClients(message);
}

const deletePin = (message: Message)=> {
  if (!message.pin) {
    return;
  }
  const deletedPin: Pin = message.pin;
  const index = pins.findIndex(pin => deletedPin.id === pin.id);
  if (index !== -1) {
    pins.splice(index, 1);
    sendMessageToOtherClients(message);
  }
}

const updatePin = (message: Message)=> {
  if (!message.pin) {
    return;
  }
  const updatedPin: Pin = message.pin;
  const index = pins.findIndex(pin => updatedPin.id === pin.id);
  if (index !== -1) {
    pins[index] = updatedPin;
    sendMessageToOtherClients(message);
  }
}

const sendMessageToOtherClients = (message: Message) => {
  clients.forEach(function each(client, clientId) {
    const isClientReady = client.readyState === WebSocket.OPEN;
    const isNotSender = message.clientId !== clientId;
    if (isClientReady && isNotSender) {
      client.send(JSON.stringify(message));
    }
  });
}
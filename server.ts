import WebSocket, {WebSocketServer} from 'ws';
import {Pin} from "./types/Pin";
import {ActionMessage, ChatMessage, InitializationMessage, UsersChangeMessage,} from "./types/Message";
import {v4 as uuidv4} from "uuid";

const wss = new WebSocketServer({port: 8080});
const serverId = 'server';
const clients: Map<string, WebSocket> = new Map();
const pins: Pin[] = [];

wss.on('connection', function connection(ws) {
  const clientId = initializedClient(ws);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const message: ActionMessage | ChatMessage = JSON.parse(data.toString());
    switch (message.type) {
      case "addPin":
        addPin(message as ActionMessage, clientId);
        break;
      case "deletePin":
        deletePin(message as ActionMessage, clientId);
        break;
      case "updatePin":
        updatePin(message as ActionMessage, clientId);
        break;
      case "chat":
        sendMessageToOtherClients(message as ChatMessage, clientId);
        break;
    }
  });

  ws.on('close', function close() {
    clients.forEach(function each(client, clientId) {
      if (client === ws) {
        clients.delete(clientId);
        console.log(`client disconnected with id: ${clientId}`);
      }
    });

    pins.forEach(pin => {
      checkValidation(pin);
    })
  });
});

const initializedClient = (ws: WebSocket): string => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  const message: InitializationMessage = {
    senderId: serverId,
    type: "initialization",
    pins: pins,
    nbOfUsers: clients.size,
    minimalNbOfValidations: getMinimalNumberOfValidation(),
    clientId: clientId,
  }

  console.log(`new client connected with id: ${clientId}`);
  ws.send(JSON.stringify(message));
  sendMessageToOtherClients({
    senderId: serverId,
    type: "usersChange",
    nbOfUsers: clients.size,
    minimalNbOfValidations: getMinimalNumberOfValidation(),
  }, clientId)

  return clientId
}

const addPin = (message: ActionMessage, clientId: string) => {
  if (!message.pin) {
    return;
  }

  const pin = checkValidation(message.pin);

  pins.push(pin);
  message.pin = pin

  sendMessageToOtherClients(message, clientId);
}

const deletePin = (message: ActionMessage, clientId: string) => {
  if (!message.pin) {
    return;
  }
  const deletedPin: Pin = message.pin;
  const index = pins.findIndex(pin => deletedPin.id === pin.id);
  if (index !== -1) {
    pins.splice(index, 1);
    sendMessageToOtherClients(message, clientId);
  }
}

const updatePin = (message: ActionMessage, clientId: string) => {
  if (!message.pin) {
    return;
  }
  const updatedPin: Pin = message.pin;
  const index = pins.findIndex(pin => updatedPin.id === pin.id);
  if (index !== -1) {
    pins[index] = updatedPin;
    sendMessageToOtherClients(message, clientId);
  }

  checkValidation(updatedPin);
}

const sendMessageToClients = (clientsId: string[], message: ActionMessage) => {
  clients.forEach(function each(client, clientId) {
    if (clientsId.includes(clientId)) {
      const isClientReady = client.readyState === WebSocket.OPEN;
      if (isClientReady) {
        client.send(JSON.stringify(message));
      }
    }
  });
}

const sendMessageToOtherClients = (message: ActionMessage | UsersChangeMessage | ChatMessage, senderId: string) => {
  clients.forEach(function each(client, clientId) {
    const isClientReady = client.readyState === WebSocket.OPEN;
    const isNotSender = senderId !== clientId;
    if (isClientReady && isNotSender) {
      client.send(JSON.stringify(message));
    }
  });
}

const checkValidation = (pin: Pin): Pin => {
  const clientIds = Array.from(clients.keys());

  const nbOfValidations = pin.validatedBy.length;

  if (nbOfValidations >= getMinimalNumberOfValidation()) {
    pin.status = "validated";
    sendMessageToClients(clientIds, {
      senderId: serverId,
      type: "updatePin",
      pin: pin,
    });
  }

  return pin;
}

const getMinimalNumberOfValidation = (): number => {
  return Math.ceil((clients.size + 1) / 2);
}
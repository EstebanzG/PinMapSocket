import {Pin} from "./Pin";

interface Message {
  senderId: string;
  type: "initialization" | "addPin" | "deletePin" | "updatePin" | "usersChange" | "chat";
}

export interface ActionMessage extends Message {
  pin: Pin;
}

export interface InitializationMessage extends Message {
  pins: Pin[];
  nbOfUsers: number;
  minimalNbOfValidations: number;
  clientId: string;
}

export interface UsersChangeMessage extends Message {
  nbOfUsers: number;
  minimalNbOfValidations: number;
}

export interface ChatMessage extends Message {
  pinId: string;
  content: string;
}
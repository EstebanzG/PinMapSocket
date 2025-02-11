import {Pin} from "./Pin";

interface Message {
  senderId: string;
  type: "initialization" | "addPin" | "deletePin" | "updatePin" | "usersChange";
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
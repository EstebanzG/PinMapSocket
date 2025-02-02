import {Pin} from "./Pin";

export interface Message {
  senderId: string;
  clientId: string;
  type: "initialization" | "addPin" | "deletePin" | "updatePin";
  pin?: Pin;
  pins?: Pin[];
}
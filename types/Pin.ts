import {ChatMessage} from "./ChatMessage";

export interface Pin {
  id: string,
  positionX: number,
  positionY: number,
  size: number,
  color?: string | null,
  name?: string | null,
  messages: ChatMessage[],
  status: "pending" | "validated",
  validatedBy: string[],
}
export interface Pin {
  id: string,
  positionX: number,
  positionY: number,
  size: number,
  color?: string | null,
  name?: string | null,
  messages: Message[],
  status: "pending" | "validated",
  validatedBy: string[],
}

interface Message {
  sender: string;
  content: string;
}
export interface Pin {
  id: string,
  positionX: number,
  positionY: number,
  size: number,
  color?: string | null,
  name?: string | null
  status: "pending" | "validated"
  validatedBy: string[]
}
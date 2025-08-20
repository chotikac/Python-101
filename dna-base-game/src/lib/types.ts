export type Base = "A" | "T" | "C" | "G";

export interface Student {
  id: string;           // UUIDv7
  name: string;         // provided by student
  roomId: string;
  cardId?: string;      // e.g. "A#0007"
  base?: Base;          // "A" | "T" | "C" | "G"
  drawnAt?: number;     // epoch ms
}

export interface RoomStatus {
  roomId: string;
  countsLeft: Record<Base, number>;
  totalLeft: number;
  totalStudents: number;
  drawnCount: number;
  students: Student[]; // may include base/cardId if drawn
}

export interface Pairing {
  A_with_T: Array<[Student, Student]>;
  C_with_G: Array<[Student, Student]>;
  unpaired: Student[]; // in case uneven or someone hasn't drawn
}
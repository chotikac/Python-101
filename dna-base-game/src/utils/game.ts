import { redis } from "@lib/redis";
import type { Base, Student, RoomStatus, Pairing } from "@lib/types";
import { randomUUID } from "crypto";

// Keys for a room
const deckKey = (roomId: string) => `room:${roomId}:deck`;              // Redis SET of unique cardIds like "A#0007"
const studentsHashKey = (roomId: string) => `room:${roomId}:students`;  // Redis HASH id -> JSON
const createdAtKey = (roomId: string) => `room:${roomId}:createdAt`;    // STR
const drawnZKey = (roomId: string) => `room:${roomId}:drawn`;           // ZSET id -> timestamp (ordering)

export function baseFromCard(cardId: string): Base {
  // "A#0007" -> "A"
  return cardId.split("#")[0] as Base;
}

function pad(n: number) { return n.toString().padStart(4, "0"); }

export async function createRoom(roomId: string, counts?: Partial<Record<Base, number>>) {
  const A = Number(process.env.DEFAULT_COUNT_A ?? 10);
  const T = Number(process.env.DEFAULT_COUNT_T ?? 10);
  const C = Number(process.env.DEFAULT_COUNT_C ?? 10);
  const G = Number(process.env.DEFAULT_COUNT_G ?? 10);

  const plan: Record<Base, number> = {
    A: counts?.A ?? A,
    T: counts?.T ?? T,
    C: counts?.C ?? C,
    G: counts?.G ?? G
  };

  // Reset everything
  await redis.del(deckKey(roomId), studentsHashKey(roomId), drawnZKey(roomId));

  // Build  unique cardIds and SADD into a set. SPOP later is atomic and gives a random card.
  const cards: string[] = [];
  (Object.keys(plan) as Base[]).forEach((b) => {
    for (let i = 1; i <= plan[b]; i++) {
      cards.push(`${b}#${pad(i)}`);
    }
  });
  if (cards.length === 0) throw new Error("Room init plan has no cards");

  await redis.sadd(deckKey(roomId), ...cards);
  await redis.set(createdAtKey(roomId), Date.now());
}

export async function resetRoom(roomId: string) {
  // Recreate with defaults
  await createRoom(roomId);
}

export async function joinRoom(roomId: string, name: string, existingId?: string): Promise<Student> {
  // If already had an id (cookie), keep it; otherwise generate a new one
  const id = existingId ?? randomUUID();

  // If already exists, return existing student (keep their draw if any)
  const existing = await redis.hget<string>(studentsHashKey(roomId), id);
  if (existing) {
    return JSON.parse(existing) as Student;
  }

  const student: Student = { id, name, roomId };
  await redis.hset(studentsHashKey(roomId), { [id]: JSON.stringify(student) });
  return student;
}

export async function drawCardOnce(roomId: string, studentId: string): Promise<Student> {
  const hkey = studentsHashKey(roomId);
  const raw = await redis.hget<string>(hkey, studentId);
  if (!raw) throw new Error("Student not found in this room");
  const student: Student = JSON.parse(raw);

  if (student.cardId && student.base) {
    // Already drew; just return previous
    return student;
  }

  // Randomly pop a card atomically from the deck (returns null if deck empty)
  const cardId = await redis.spop<string>(deckKey(roomId));
  if (!cardId) {
    throw new Error("Deck is empty. All cards have been drawn.");
  }
  const base = baseFromCard(cardId);

  const drawnAt = Date.now();
  const updated: Student = { ...student, cardId, base, drawnAt };

  // Save back and record order
  await Promise.all([
    redis.hset(hkey, { [studentId]: JSON.stringify(updated) }),
    redis.zadd(drawnZKey(roomId), { score: drawnAt, member: studentId })
  ]);

  return updated;
}

export async function getStatus(roomId: string): Promise<RoomStatus> {
  // Cards left: SMEMBERS (small: max 40)
  const members = (await redis.smembers<string>(deckKey(roomId))) ?? [];
  const counts: Record<Base, number> = { A: 0, T: 0, C: 0, G: 0 };
  members.forEach((cid) => { counts[baseFromCard(cid)]++; });

  const studentsRaw = await redis.hgetall<string>(studentsHashKey(roomId));
  const students: Student[] = Object.entries(studentsRaw ?? {}).map(([_, v]) => JSON.parse(v));

  const drawnCount = students.filter(s => s.base).length;

  return {
    roomId,
    countsLeft: counts,
    totalLeft: members.length,
    totalStudents: students.length,
    drawnCount,
    students
  };
}

export async function suggestPairs(roomId: string): Promise<Pairing> {
  const status = await getStatus(roomId);

  const A = status.students.filter(s => s.base === "A");
  const T = status.students.filter(s => s.base === "T");
  const C = status.students.filter(s => s.base === "C");
  const G = status.students.filter(s => s.base === "G");
  const unpaired = status.students.filter(s => !s.base);

  // Pair by order
  const A_with_T: Array<[Student, Student]> = [];
  const C_with_G: Array<[Student, Student]> = [];

  const lenAT = Math.min(A.length, T.length);
  for (let i = 0; i < lenAT; i++) A_with_T.push([A[i], T[i]]);

  const lenCG = Math.min(C.length, G.length);
  for (let i = 0; i < lenCG; i++) C_with_G.push([C[i], G[i]]);

  // Any leftovers (e.g., uneven draws) become unpaired
  const leftovers = [
    ...A.slice(lenAT), ...T.slice(lenAT),
    ...C.slice(lenCG), ...G.slice(lenCG)
  ];

  return { A_with_T, C_with_G, unpaired: [...unpaired, ...leftovers] };
}
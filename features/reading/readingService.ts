import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { ReadingSession, SessionType } from "@/types";

// Înregistrează o sesiune (focus timer sau check-in). Câmpul e mereu
// "pagesReached" — pagina la care a ajuns userul, NU numărul de pagini
// citite în sesiune. Nu inversa asta. Vezi AGENTS.md.
export async function logReadingSession(
  userId: string,
  userBookId: string,
  pagesReached: number,
  type: SessionType,
  startTime: number,
  endTime: number = Date.now(),
): Promise<void> {
  const session: Omit<ReadingSession, "id"> = {
    userId,
    userBookId,
    startTime,
    endTime,
    pagesReached,
    type,
  };

  await addDoc(collection(db, "readingSessions"), session);
  await updateDoc(doc(db, "userBooks", userBookId), { currentPage: pagesReached });
}

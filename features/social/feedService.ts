import { addDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { FeedPost, FeedPostType } from "@/types";

// Postările de feed NU au comentarii — doar apreciere și distribuire.
// Nu adăuga un sistem de comentarii fără discuție explicită. Vezi AGENTS.md.
export async function createFeedPost(
  userId: string,
  type: FeedPostType,
  content: string,
  visibility: FeedPost["visibility"] = "friends",
): Promise<void> {
  await addDoc(collection(db, "feedPosts"), {
    userId,
    type,
    content,
    visibility,
    createdAt: Date.now(),
  });
}

// Fallback pentru useri fără prieteni: conținut public, ca feed-ul să nu
// fie gol la prima deschidere a aplicației. Vezi 04-roadmap.docx, Faza 3.
export async function getPublicFeedFallback(count: number = 20) {
  const q = query(
    collection(db, "feedPosts"),
    where("visibility", "==", "public"),
    orderBy("createdAt", "desc"),
    limit(count),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

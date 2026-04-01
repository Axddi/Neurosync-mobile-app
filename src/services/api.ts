import 'react-native-get-random-values';
import { getCurrentUserAttributes } from "./cognitoClient";

const BASE_URL =
  "https://jjcesnuis1.execute-api.ap-south-1.amazonaws.com/default";

  export async function getMoodLogs() {
  try {
    const { userId } = await getCurrentUserAttributes();

    console.log("USER ID:", userId);

    if (!userId) {
      console.log("NO USER ID → returning empty");
      return [];
    }

    const res = await fetch(`${BASE_URL}/getMoodLogs?userId=${userId}`, {
      cache: "no-store", 
    });

    console.log("API STATUS:", res.status);

    const data = await res.json();

    console.log("API DATA:", data);

    return data.Items || [];
  } catch (err) {
    console.log("SAFE getMoodLogs ERROR:", err);
    return [];
  }
}
export async function createMoodLog(data: any) {
  try {
    const { userId } = await getCurrentUserAttributes();
    if (!userId) return;

    const res = await fetch(`${BASE_URL}/createMoodLog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        mood: data.mood,
        tags: data.tags,
        note: data.note,
      }),
    });

    if (!res.ok) return;
    return res.json();
  } catch (err) {
    console.log("SAFE createMoodLog:", err);
  }
}
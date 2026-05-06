import { Log } from "../../logging_middleware/logger";
import type { Notification } from "./types/notification";

const TYPE_WEIGHTS: Record<string, number> = {
  Placement: 3000,
  Result: 2000,
  Event: 1000,
};

export const getTopNotifications = async (limit: number) => {
  const API_URL = "http://20.207.122.201/evaluation-service/notifications";
  const TOKEN = import.meta.env.VITE_ACCESS_TOKEN;
  const LOG_URL = import.meta.env.VITE_API_URL;

  await Log(
    TOKEN,
    LOG_URL,
    "frontend",
    "info",
    "api",
    "Starting notification fetch",
  );

  try {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!response.ok) throw new Error("Failed to fetch notifications");

    const payload = await response.json();
    const notifications: Notification[] = Array.isArray(payload)
      ? payload
      : payload.notifications || payload.data || [];

    const sorted = notifications.sort((a, b) => {
      const weightA = TYPE_WEIGHTS[a.Type] || 0;
      const weightB = TYPE_WEIGHTS[b.Type] || 0;

      const timeA = new Date(a.Timestamp).getTime();
      const timeB = new Date(b.Timestamp).getTime();

      const scoreA = weightA + timeA;
      const scoreB = weightB + timeB;

      return scoreB - scoreA;
    });

    await Log(
      TOKEN,
      LOG_URL,
      "frontend",
      "debug",
      "utils",
      "Priority sorting successful",
    );

    return sorted.slice(0, limit);
  } catch (error: any) {
    await Log(TOKEN, LOG_URL, "frontend", "error", "api", error.message);
    return [];
  }
};

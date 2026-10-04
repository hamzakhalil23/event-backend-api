import Expo, { ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { PushMessage } from "../types/push-message";
import { prisma } from "../lib/db";

const expo = new Expo();

export async function sendPushNotifications(
  messages: PushMessage[],
): Promise<ExpoPushTicket[]> {
  const valid: ExpoPushMessage[] = messages
    .filter((m) => Expo.isExpoPushToken(m.to))
    .map((m) => ({
      to: m.to,
      title: m.title,
      body: m.body,
      sound: m.sound ?? "default",
      data: m.data,
    }));

  if (!valid.length) return [];

  const chunks = expo.chunkPushNotifications(valid);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const result = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...result);
    } catch (err) {
      console.error("Push notification chunk failed:", err);
    }
  }

  return tickets;
}

export async function cleanupStaleTokens(
  tickets: ExpoPushTicket[],
  tokens: string[],
): Promise<void> {
  const staleTokens: string[] = [];

  tickets.forEach((ticket, idx) => {
    if (
      ticket.status === "error" &&
      ticket.details?.error === "DeviceNotRegistered"
    ) {
      staleTokens.push(tokens[idx]);
    }
  });

  if (staleTokens.length) {
    await prisma.deviceToken.deleteMany({
      where: { token: { in: staleTokens } },
    });
    console.log(`Cleaned up ${staleTokens.length} stale device tokens`);
  }
}

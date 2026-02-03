import { getDb } from '../db';
import { notifications } from '../db-schema';
import { isNull, gt, and } from 'drizzle-orm';
import { FarcasterUser, NotificationEventPayload, NotificationEventPayloadSchema } from './types';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function getFarcasterUsers(
  addresses: string[],
): Promise<Record<string, FarcasterUser[]>> {
  try {
    if (!NEYNAR_API_KEY) {
      throw Error("Neynar key not found");
    }

    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${addresses.join(
      ",",
    )}`;
    const options = {
      method: "GET",
      headers: { "x-api-key": NEYNAR_API_KEY },
    };
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Neynar request failed with ${response.status}`);
    }
    const data = (await response.json()) as Record<string, FarcasterUser[]>;
    return data;
  } catch (error) {
    return {};
  }
}

export async function getDisplayName(address: string): Promise<string> {
  const users = await getFarcasterUsers([address.toLowerCase()]);
  const userArray = users[address.toLowerCase()];
  if (userArray && userArray[0]?.username) {
    return `@${userArray[0].username}`;
  }
  return address.slice(0, 7);
}

export async function getFarcasterFids(addresses: string[]): Promise<number[]> {
  const farcasterUsers = await getFarcasterUsers(
    addresses.map((a) => a.toLowerCase()),
  );
  return Object.values(farcasterUsers)
    .map((u) =>
      Array.isArray(u)
        ? (u[0] as { fid?: number } | null)
        : (u as { fid?: number } | null),
    )
    .filter((u): u is { fid: number } => u != null && typeof u.fid === "number")
    .map((u) => u.fid);
}

export async function getRecentActivity(): Promise<NotificationEventPayload[]>  {
  try {
    const db = getDb();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          gt(notifications.created_at, fiveMinutesAgo),
          isNull(notifications.send_at)
        )
      )
      .orderBy(notifications.created_at);

    const parsedActivity = result.map((row) => {
      const payload = {
        id: row.id,
        event: row.event,
        data: row.data,
      };
      return NotificationEventPayloadSchema.parse(payload) as NotificationEventPayload;
    });
    return parsedActivity;
  } catch (error) {
    console.error('Error querying activity:', error);
    return [];
  }
}
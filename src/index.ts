import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { db } from './db';
import { notifications } from './db-schema';
import { isNull } from 'drizzle-orm';
import { NotificationRowSchema } from './schemas';

const app = new Hono();

async function queryNotifications() {
  try {
    const result = await db
      .select()
      .from(notifications)
      .where(isNull(notifications.send_at))
      .orderBy(notifications.created_at);

    const parsedNotifications = result.map((row) => NotificationRowSchema.parse(row));
    console.log(`[${new Date().toISOString()}] Found ${parsedNotifications.length} unsent notifications`);
    return parsedNotifications;
  } catch (error) {
    console.error('Error querying notifications:', error);
    return [];
  }
}

setInterval(() => {
  queryNotifications();
}, 10000);

queryNotifications().then((notifications) => {
  console.log(`Initial query: ${notifications.length} notifications found`);
});

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/api/echo', (c) => {
  const query = c.req.query();
  return c.json({ message: 'poidh notification service', query });
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Hono server running on http://localhost:${port}`);

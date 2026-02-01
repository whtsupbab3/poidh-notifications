import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getNewActivity } from './utils/utils';
import { processBountyCreated, processBountyJoined, processClaimAccepted, processClaimCreated, processVotingStarted } from './utils/notifications';
import { db } from './db';
import { notifications } from './db-schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

setInterval(async () => {
  const newActivities = await getNewActivity();
  console.log(`${newActivities.length} notifications found`);

  for (const act of newActivities) {
    if (act.event === 'BountyCreated') {
      await processBountyCreated(act);
    } else if (act.event === 'BountyJoined') {
      await processBountyJoined(act);
    } else if (act.event === 'ClaimCreated') {
      await processClaimCreated(act);
    } else if (act.event === 'ClaimAccepted') {
      await processClaimAccepted(act);
    } else if (act.event === 'VotingStarted') {
      await processVotingStarted(act);
    }

    await db.update(notifications).set({ send_at: new Date() }).where(eq(notifications.id, act.id));
  }
}, 10000);

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

import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getRecentActivity } from './utils/utils';
import {
  processBountyCreated,
  processBountyJoined,
  processClaimAccepted,
  processClaimCreated,
  processCommentCreated,
  processReplyCreated,
  processVotingStarted,
} from './utils/notifications';
import { getDb } from './db';
import { notifications } from './db-schema';
import { eq } from 'drizzle-orm';

const app = new Hono();
let lastProcessedIndex = -1;

setInterval(async () => {
  const newActivities = await getRecentActivity();
  const db = getDb();

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
    } else if (act.event === 'CommentCreated') {
      await processCommentCreated(act);
    } else if (act.event === 'ReplyCreated') {
      await processReplyCreated(act);
    }

    await db.update(notifications).set({ send_at: new Date() }).where(eq(notifications.id, act.id));
    lastProcessedIndex = act.id;
  }
}, 5 * 1000);

app.get('/health', (c) => c.json({ status: 'ok', lastProcessedIndex }));

app.get('/api/echo', (c) => {
  const query = c.req.query();
  return c.json({ message: 'poidh notification service', query });
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port,
});

import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getNewActivity } from './utils/utils';

const app = new Hono();


setInterval(async () => {
  const newActivities = await getNewActivity();
  console.log(`${newActivities.length} notifications found`);

  for (const act of newActivities) {
    if (act.event === 'BountyCreated') {
      // Handle BountyCreated event
    } else if (act.event === 'BountyJoined') {
      // Handle BountyJoined event
    } else if (act.event === 'ClaimCreated') {
      // Handle ClaimCreated event
    } else if (act.event === 'ClaimAccepted') {
      // Handle ClaimAccepted event
    } else if (act.event === 'VotingStarted') {
      // Handle VotingStarted event
    }
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
import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getDisplayName, getFarcasterFids, getNewActivity } from './utils/utils';
import type { NotificationEventPayload } from './utils/types';
import { getChainById, POIDH_BASE_URL } from './utils/config';
import { sendNotification } from './utils/notifications';

const app = new Hono();

setInterval(async () => {
  const newActivities: NotificationEventPayload[] = await getNewActivity();
  console.log(`${newActivities.length} notifications found`);

  for (const act of newActivities) {
    if (act.event === 'BountyCreated') {
      // Send a notification when a bounty of $100 or more is posted.
      if (act.data.amount > 100) {
        const chain = getChainById({ chainId: act.data.chainId });
        const creatorName = await getDisplayName(act.data.issuer);
        await sendNotification({
          title: `💰 NEW $${act.data.amount.toFixed(0)} BOUNTY 💰`,
          messageBody: `${act.data.title}${creatorName ? ` from ${creatorName}` : ''}`,
          targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${act.data.id}`,
          targetFIds: [894764],
        });
      }
    } else if (act.event === 'BountyJoined') {
      console.log('BountyJoined');
    } else if (act.event === 'ClaimCreated') {
      const targetFIds = await getFarcasterFids(act.data.bounty.participants);

      // Send a notification to all bounty participants
      if (targetFIds.length > 0) {
        const claimCreatorName = await getDisplayName(act.data.claim.issuer);
        const bounty = act.data.bounty;
        const chain = getChainById({ chainId: act.data.claim.chainId });

        await sendNotification({
          title: 'new claim on poidh 🖼️',
          messageBody: `${bounty?.title} has received a new claim from ${claimCreatorName}`,
          targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${bounty.id}`,
          targetFIds,
        });
      }
    } else if (act.event === 'ClaimAccepted') {
    } else if (act.event === 'VotingStarted') {
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

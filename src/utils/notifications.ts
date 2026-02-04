import { getChainById, POIDH_BASE_URL } from './config';
import { ChainId, NotificationEventPayload } from './types';
import { getDisplayName, getFarcasterFids } from './utils';
import { formatEther } from 'viem';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

async function sendNotification({
  title,
  messageBody,
  targetUrl,
  targetFIds = [],
}: {
  title: string;
  messageBody: string;
  targetUrl: string;
  targetFIds?: Array<number>;
}) {
  if (!NEYNAR_API_KEY) {
    throw Error('Neynar key not found');
  }

  const url = 'https://api.neynar.com/v2/farcaster/frame/notifications/';

  const options = {
    method: 'POST',
    headers: {
      'x-api-key': NEYNAR_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_fids: targetFIds,
      notification: { title: title, body: messageBody, target_url: targetUrl },
    }),
  };

  let i = 3;
  while (i-- !== 0) {
    try {
      const response = await (await fetch(url, options)).json();
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  return null;
}

export async function processBountyCreated(
  activity: Extract<NotificationEventPayload, { event: 'BountyCreated' }>
) {
  // Send a notification when a bounty of $100 or more is posted
  if (activity.data.amountUSD >= 100) {
    const chain = getChainById({ chainId: activity.data.chainId as ChainId });
    const creatorName = await getDisplayName(activity.data.issuer);
    await sendNotification({
      title: `💰 NEW $${activity.data.amountUSD.toFixed(0)} BOUNTY 💰`,
      messageBody: `${activity.data.title}${creatorName ? ` from ${creatorName}` : ''}`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${activity.data.id}`,
    });
  }
}

export async function processClaimCreated(
  activity: Extract<NotificationEventPayload, { event: 'ClaimCreated' }>
) {
  const targetFIds = await getFarcasterFids(activity.data.bounty.participants);

  // Send a notification when claim is created to bounty participants
  if (targetFIds.length > 0) {
    const claimCreatorName = await getDisplayName(activity.data.claim.issuer);
    const chain = getChainById({ chainId: activity.data.claim.chainId as ChainId });

    await sendNotification({
      title: 'new claim on poidh 🖼️',
      messageBody: `${activity.data.bounty.title} has received a new claim from ${claimCreatorName}`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${activity.data.bounty.id}`,
      targetFIds,
    });
  }
}

export async function processVotingStarted(
  activity: Extract<NotificationEventPayload, { event: 'VotingStarted' }>
) {
  const chain = getChainById({ chainId: activity.data.claim.chainId as ChainId });
  const nominatedUserTargetFids = await getFarcasterFids([activity.data.claim.issuer]);

  // Send a notification when claim is nominated to claim issuer
  if (nominatedUserTargetFids.length > 0) {
    await sendNotification({
      title: `your claim is nominated 🗳️`,
      messageBody: `your claim is up for vote for ${activity.data.bounty.title} - contributors will now vote to confirm`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${activity.data.bounty.id}`,
      targetFIds: nominatedUserTargetFids,
    });
  }

  const bountyIssuerDisplayName = await getDisplayName(activity.data.bounty.issuer);
  const bountyParticipantsTargetFids = await getFarcasterFids(activity.data.bounty.participants);

  // Send a notification when claim is nominated to bounty participants
  if (bountyParticipantsTargetFids.length > 0) {
    const bountyIssuerDisplayName = await getDisplayName(activity.data.bounty.issuer);
    await sendNotification({
      title: `your vote is needed 🗳️`,
      messageBody: `${bountyIssuerDisplayName} has proposed a winner for ${activity.data.bounty.title} - you have 48 hours to vote`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${activity.data.bounty.id}`,
      targetFIds: bountyParticipantsTargetFids,
    });
  }

  // Send a notification when claim is nominated to other claimers
  const claimIssuerFIds = await getFarcasterFids(activity.data.otherClaimers);
  if (claimIssuerFIds.length > 0) {
    await sendNotification({
      title: `your claim was not nominated`,
      messageBody: `${bountyIssuerDisplayName} has proposed a winner for ${activity.data.bounty.title} - your claim was not selected`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${activity.data.bounty.id}`,
      targetFIds: claimIssuerFIds,
    });
  }
}

export async function processClaimAccepted(
  activity: Extract<NotificationEventPayload, { event: 'ClaimAccepted' }>
) {
  const chain = getChainById({ chainId: activity.data.claim.chainId as ChainId });

  // Send a notification to bounty winners when their claim is accepted
  const targetFIds = await getFarcasterFids([activity.data.claim.issuer.toLowerCase()]);
  if (targetFIds.length > 0) {
    const creatorName = await getDisplayName(activity.data.bounty.issuer);
    await sendNotification({
      title: 'you won a bounty! 🏆',
      messageBody: `you're the winner of ${activity.data.bounty.title} from ${creatorName} - claim funds via your in-app profile page"`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${activity.data.bounty.id}`,
      targetFIds,
    });
  }
}

export async function processBountyJoined(
  activity: Extract<NotificationEventPayload, { event: 'BountyJoined' }>
) {
  const bounty = activity.data.bounty;
  const chain = getChainById({ chainId: activity.data.bounty.chainId as ChainId });

  // Send a notification when a bounty reached a price of $100 or more
  if (bounty.amountUSD >= 100 && bounty.amountUSD - activity.data.participant.amountUSD < 100) {
    const creatorName = await getDisplayName(bounty.issuer);
    await sendNotification({
      title: `💰 NEW $${bounty.amountUSD} BOUNTY 💰`,
      messageBody: `${bounty.title}${creatorName ? ` from ${creatorName}` : ''}`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${bounty.id}`,
    });
  }

  // Send a notification to bounty participants when someone contributed to bounty
  const bountyParticipantsTargetFids = await getFarcasterFids(bounty.participants);
  if (bountyParticipantsTargetFids.length > 0) {
    const contributorDisplayName = await getDisplayName(activity.data.participant.address);
    await sendNotification({
      title: 'new contribution on poidh 💰',
      messageBody: `${bounty.title} has received a contribution of ${formatEther(
        BigInt(activity.data.participant.amountCrypto)
      )} ${chain.currency.toUpperCase()} from ${contributorDisplayName}`,
      targetUrl: `${POIDH_BASE_URL}/${chain.slug}/bounty/${bounty.id}`,
      targetFIds: bountyParticipantsTargetFids,
    });
  }
}

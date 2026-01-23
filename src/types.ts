import { z } from 'zod';

export const FarcasterUserSchema = z.object({
  fid: z.number(),
  username: z.string(),
});

export type FarcasterUser = z.infer<typeof FarcasterUserSchema>;

const Address = z.custom<`0x${string}`>(
  (val: string) => /^0x[0-9a-fA-F]*$/.test(val),
  {
    message: 'Invalid Ethereum address',
  }
);

const BountyBaseData = z.object({
  id: z.number(),
  chainId: z.number(),
  onChainId: z.number(),
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  issuer: Address,
  createdAt: z.number(),
  inProgress: z.boolean(),
  isJoinedBounty: z.boolean(),
  isCanceled: z.boolean(),
  isMultiplayer: z.boolean(),
  isVoting: z.boolean(),
  deadline: z.number().nullable().optional(),
  currency: z.string(),
});

const BountyWithParticipantsData = BountyBaseData.extend({
  participants: z.array(Address),
});

const ClaimEventData = z.object({
  id: z.number(),
  chainId: z.number(),
  onChainId: z.number(),
  bountyId: z.number(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  issuer: Address,
  owner: Address,
  isVoting: z.boolean(),
  isAccepted: z.boolean(),
});

const BountyCreatedEventData = BountyBaseData;

const BountyJoinedEventData = z.object({
  participant: z.object({
    address: Address,
    amount: z.number(),
  }),
  bounty: BountyWithParticipantsData,
});

const ClaimCreatedEventData = z.object({
  bounty: BountyWithParticipantsData,
  claim: ClaimEventData,
});

const ClaimAcceptedEventData = z.object({
  bounty: BountyWithParticipantsData,
  claim: ClaimEventData,
});

const VotingStartedEventData = z.object({
  bounty: BountyWithParticipantsData,
  claim: ClaimEventData,
  otherClaimers: z.array(Address),
});

export const NotificationEventPayloadSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('BountyCreated'),
    data: BountyCreatedEventData,
  }),
  z.object({
    event: z.literal('BountyJoined'),
    data: BountyJoinedEventData,
  }),
  z.object({
    event: z.literal('ClaimCreated'),
    data: ClaimCreatedEventData,
  }),
  z.object({
    event: z.literal('ClaimAccepted'),
    data: ClaimAcceptedEventData,
  }),
  z.object({
    event: z.literal('VotingStarted'),
    data: VotingStartedEventData,
  }),
]);

export type NotificationEventPayload = z.infer<typeof NotificationEventPayloadSchema>;

export const NotificationRowSchema = z.object({
  id: z.number(),
  created_at: z.date(),
  event: z.enum([
    'BountyCreated',
    'BountyJoined',
    'ClaimCreated',
    'ClaimAccepted',
    'VotingStarted',
  ]),
  data: NotificationEventPayloadSchema,
  send_at: z.date().nullable(),
});

export type NotificationRow = z.infer<typeof NotificationRowSchema>;

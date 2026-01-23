import { z } from 'zod';

export const FarcasterUserSchema = z.object({
  fid: z.number(),
  username: z.string(),
});

export type FarcasterUser = z.infer<typeof FarcasterUserSchema>;

export type Currency = 'eth' | 'degen';

export type Netname = 'degen' | 'base' | 'arbitrum';

export type ChainId = 666666666 | 42161 | 8453;

export type Chain = {
  id: number;
  name: string;
  currency: Currency;
  slug: Netname;
};

const AddressSchema = z.custom<`0x${string}`>(
  (val: string) => /^0x[0-9a-fA-F]*$/.test(val),
  {
    message: 'Invalid Ethereum address',
  }
);

const BountyBaseDataSchema = z.object({
  id: z.number(),
  chainId: z.union([z.literal(666666666), z.literal(42161), z.literal(8453)]),
  onChainId: z.number(),
  title: z.string(),
  description: z.string(),
  amount: z.number(),
  issuer: AddressSchema,
  createdAt: z.number(),
  inProgress: z.boolean(),
  isJoinedBounty: z.boolean(),
  isCanceled: z.boolean(),
  isMultiplayer: z.boolean(),
  isVoting: z.boolean(),
  deadline: z.number().nullable().optional(),
  currency: z.string(),
});

const BountyWithParticipantsDataSchema = BountyBaseDataSchema.extend({
  participants: z.array(AddressSchema),
});

const ClaimEventDataSchema = z.object({
  id: z.number(),
  chainId: z.union([z.literal(666666666), z.literal(42161), z.literal(8453)]),
  onChainId: z.number(),
  bountyId: z.number(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  issuer: AddressSchema,
  owner: AddressSchema,
  isVoting: z.boolean(),
  isAccepted: z.boolean(),
});

const BountyCreatedEventDataSchema = BountyBaseDataSchema;

const BountyJoinedEventDataSchema = z.object({
  participant: z.object({
    address: AddressSchema,
    amount: z.number(),
  }),
  bounty: BountyWithParticipantsDataSchema,
});

const ClaimCreatedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
});

const ClaimAcceptedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
});

const VotingStartedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
  otherClaimers: z.array(AddressSchema),
});

export const NotificationEventPayloadSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('BountyCreated'),
    data: BountyCreatedEventDataSchema,
  }),
  z.object({
    event: z.literal('BountyJoined'),
    data: BountyJoinedEventDataSchema,
  }),
  z.object({
    event: z.literal('ClaimCreated'),
    data: ClaimCreatedEventDataSchema,
  }),
  z.object({
    event: z.literal('ClaimAccepted'),
    data: ClaimAcceptedEventDataSchema,
  }),
  z.object({
    event: z.literal('VotingStarted'),
    data: VotingStartedEventDataSchema,
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

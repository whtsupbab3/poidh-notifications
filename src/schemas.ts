import { z } from 'zod';
import type { NotificationEventPayload } from './types';

const AddressSchema = z.custom<`0x${string}`>(
  (val: unknown) => typeof val === 'string' && /^0x[0-9a-fA-F]*$/.test(val),
  { message: 'Invalid Ethereum address' }
);

const BountyBaseDataSchema = z.object({
  id: z.number(),
  chainId: z.number(),
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
  chainId: z.number(),
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

export const NotificationEventPayloadSchema: z.ZodType<NotificationEventPayload> = z.union([
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

export const NotificationRowSchema = z.object({
  id: z.number(),
  created_at: z.date(),
  event: z.string(),
  data: z.record(z.unknown()),
  send_at: z.date().nullable(),
});

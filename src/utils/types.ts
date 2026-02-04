import { z } from 'zod';

export const FarcasterUserSchema = z.object({
  fid: z.number(),
  username: z.string(),
});

export type FarcasterUser = z.infer<typeof FarcasterUserSchema>;

export type Address = `0x${string}`;

export type Currency = 'eth' | 'degen';

export type Netname = 'degen' | 'base' | 'arbitrum';

export type ChainId = 666666666 | 42161 | 8453;

export type Chain = {
  id: number;
  name: string;
  currency: Currency;
  slug: Netname;
};

const AddressSchema = z.custom<Address>((val: string) => /^0x[0-9a-fA-F]*$/.test(val), {
  message: 'Invalid Ethereum address',
});

const BountyBaseDataSchema = z.object({
  id: z.number(),
  chainId: z.union([z.literal(666666666), z.literal(42161), z.literal(8453)]),
  onChainId: z.number(),
  title: z.string(),
  description: z.string(),
  amountUSD: z.number(),
  amountCrypto: z.string(),
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

export type BountyBaseData = z.infer<typeof BountyBaseDataSchema>;

const BountyWithParticipantsDataSchema = BountyBaseDataSchema.extend({
  participants: z.array(AddressSchema),
});

export type BountyWithParticipantsData = z.infer<typeof BountyWithParticipantsDataSchema>;

export type WithdrawalAmountsData = {
  withdrawalAmountDegen: number | null;
  withdrawalAmountBase: number | null;
  withdrawalAmountArbitrum: number | null;
};

export type WithdrawIssuerData = {
  address: Address;
  amountCrypto: string;
  amountUSD: number;
  withdrawalAmounts: WithdrawalAmountsData;
};

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

export type ClaimEventData = z.infer<typeof ClaimEventDataSchema>;

const BountyCreatedEventDataSchema = BountyBaseDataSchema;

export type BountyCreatedEventData = z.infer<typeof BountyCreatedEventDataSchema>;

const BountyJoinedEventDataSchema = z.object({
  participant: z.object({
    address: AddressSchema,
    amountCrypto: z.string(),
    amountUSD: z.number(),
  }),
  bounty: BountyWithParticipantsDataSchema,
});

export type BountyJoinedEventData = z.infer<typeof BountyJoinedEventDataSchema>;

const ClaimCreatedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
});

export type ClaimCreatedEventData = z.infer<typeof ClaimCreatedEventDataSchema>;

const ClaimAcceptedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
});

export type ClaimAcceptedEventData = z.infer<typeof ClaimAcceptedEventDataSchema>;

const VotingStartedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
  otherClaimers: z.array(AddressSchema),
});

export type VotingStartedEventData = z.infer<typeof VotingStartedEventDataSchema>;

const WithdrawFromOpenBountyEventDataSchema = z.object({
  issuer: z.object({
    address: AddressSchema,
    amountCrypto: z.string(),
    amountUSD: z.number(),
    withdrawalAmounts: z.object({
      withdrawalAmountDegen: z.number().nullable(),
      withdrawalAmountBase: z.number().nullable(),
      withdrawalAmountArbitrum: z.number().nullable(),
    }),
  }),
  bounty: BountyWithParticipantsDataSchema,
});

const WithdrawalEventDataSchema = z.object({
  issuer: z.object({
    address: AddressSchema,
    amountCrypto: z.string(),
    amountUSD: z.number(),
    withdrawalAmounts: z.object({
      withdrawalAmountDegen: z.number().nullable(),
      withdrawalAmountBase: z.number().nullable(),
      withdrawalAmountArbitrum: z.number().nullable(),
    }),
  }),
});

const WithdrawalToEventDataSchema = z.object({
  to: AddressSchema,
  issuer: z.object({
    address: AddressSchema,
    amountCrypto: z.string(),
    amountUSD: z.number(),
    withdrawalAmounts: z.object({
      withdrawalAmountDegen: z.number().nullable(),
      withdrawalAmountBase: z.number().nullable(),
      withdrawalAmountArbitrum: z.number().nullable(),
    }),
  }),
});

const CommentCreatedEventDataSchema = z.object({
  addresses: z.array(AddressSchema).optional(),
  link: z.string(),
  message: z.string(),
  issuer: AddressSchema,
});

const ReplyCreatedEventDataSchema = CommentCreatedEventDataSchema;

export type WithdrawFromOpenBountyEventData = z.infer<typeof WithdrawFromOpenBountyEventDataSchema>;
export type WithdrawalEventData = z.infer<typeof WithdrawalEventDataSchema>;
export type WithdrawalToEventData = z.infer<typeof WithdrawalToEventDataSchema>;
export type CommentCreatedEventData = z.infer<typeof CommentCreatedEventDataSchema>;
export type ReplyCreatedEventData = z.infer<typeof ReplyCreatedEventDataSchema>;

export type NotificationEventPayload =
  | {
      id: number;
      event: 'BountyCreated';
      data: BountyCreatedEventData;
    }
  | {
      id: number;
      event: 'BountyJoined';
      data: BountyJoinedEventData;
    }
  | {
      id: number;
      event: 'ClaimCreated';
      data: ClaimCreatedEventData;
    }
  | {
      id: number;
      event: 'ClaimAccepted';
      data: ClaimAcceptedEventData;
    }
  | {
      id: number;
      event: 'WithdrawFromOpenBounty';
      data: WithdrawFromOpenBountyEventData;
    }
  | {
      id: number;
      event: 'Withdrawal';
      data: WithdrawalEventData;
    }
  | {
      id: number;
      event: 'WithdrawalTo';
      data: WithdrawalToEventData;
    }
  | {
      id: number;
      event: 'VotingStarted';
      data: VotingStartedEventData;
    }
  | {
      id: number;
      event: 'CommentCreated';
      data: CommentCreatedEventData;
    }
  | {
      id: number;
      event: 'ReplyCreated';
      data: ReplyCreatedEventData;
    };

export const NotificationEventPayloadSchema = z.discriminatedUnion('event', [
  z.object({
    id: z.number(),
    event: z.literal('BountyCreated'),
    data: BountyCreatedEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('BountyJoined'),
    data: BountyJoinedEventDataSchema,
  }),
  z.object({
    id: z.number().optional(),
    event: z.literal('ClaimCreated'),
    data: ClaimCreatedEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('ClaimAccepted'),
    data: ClaimAcceptedEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('WithdrawFromOpenBounty'),
    data: WithdrawFromOpenBountyEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('Withdrawal'),
    data: WithdrawalEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('WithdrawalTo'),
    data: WithdrawalToEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('VotingStarted'),
    data: VotingStartedEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('CommentCreated'),
    data: CommentCreatedEventDataSchema,
  }),
  z.object({
    id: z.number(),
    event: z.literal('ReplyCreated'),
    data: ReplyCreatedEventDataSchema,
  }),
]);

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

const AddressSchema = z.custom<Address>(
  (val: string) => /^0x[0-9a-fA-F]*$/.test(val),
  {
    message: 'Invalid Ethereum address',
  }
);

export type BountyBaseData = {
  id: number;
  chainId: number;
  onChainId: number;
  amountUSD: number;
  amountCrypto: string;
  title: string;
  description: string;
  issuer: Address;
  createdAt: number;
  inProgress: boolean;
  isJoinedBounty: boolean;
  isCanceled: boolean;
  isMultiplayer: boolean;
  isVoting: boolean;
  deadline?: number | null;
  currency: string;
};

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

export type BountyWithParticipantsData = BountyBaseData & {
  participants: Address[];
};

const BountyWithParticipantsDataSchema = BountyBaseDataSchema.extend({
  participants: z.array(AddressSchema),
});

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

export type ClaimEventData = {
  id: number;
  chainId: number;
  onChainId: number;
  bountyId: number;
  title: string;
  description: string;
  url: string;
  issuer: Address;
  owner: Address;
  isVoting: boolean;
  isAccepted: boolean;
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

export type BountyCreatedEventData = BountyBaseData;

const BountyCreatedEventDataSchema = BountyBaseDataSchema;

export type BountyJoinedEventData = {
  participant: {
    address: Address;
    amountCrypto: string;
    amountUSD: number;
  };
  bounty: BountyWithParticipantsData;
};

const BountyJoinedEventDataSchema = z.object({
  participant: z.object({
    address: AddressSchema,
    amountCrypto: z.string(),
    amountUSD: z.number(),
  }),
  bounty: BountyWithParticipantsDataSchema,
});

export type ClaimCreatedEventData = {
  bounty: BountyWithParticipantsData;
  claim: ClaimEventData;
};

const ClaimCreatedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
});

export type ClaimAcceptedEventData = {
  bounty: BountyWithParticipantsData;
  claim: ClaimEventData;
};

const ClaimAcceptedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
});

export type WithdrawFromOpenBountyEventData = {
  issuer: WithdrawIssuerData;
  bounty: BountyWithParticipantsData;
};

export type WithdrawalEventData = {
  issuer: WithdrawIssuerData;
};

export type WithdrawalToEventData = {
  to: Address;
  issuer: WithdrawIssuerData;
};

export type VotingStartedEventData = {
  bounty: BountyWithParticipantsData;
  claim: ClaimEventData;
  otherClaimers: Address[];
};

const VotingStartedEventDataSchema = z.object({
  bounty: BountyWithParticipantsDataSchema,
  claim: ClaimEventDataSchema,
  otherClaimers: z.array(AddressSchema),
});

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
]);
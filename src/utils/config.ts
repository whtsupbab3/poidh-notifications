export const POIDH_BASE_URL = 'https://poidh.xyz/';
import { Chain, ChainId, Netname } from './types';

export const chains: Record<Netname, Chain> = {
  degen: {
    id: 666666666,
    name: 'Degen Mainnet',
    slug: 'degen',
    currency: 'degen',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    slug: 'arbitrum',
    currency: 'eth',
  },
  base: {
    id: 8453,
    name: 'Base Network',
    slug: 'base',
    currency: 'eth',
  },
};

export function getChainById({ chainId }: { chainId: ChainId }) {
  return Object.values(chains).find((chain) => chain.id === chainId)!;
}

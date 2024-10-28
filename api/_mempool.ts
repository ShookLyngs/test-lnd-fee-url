import type { VercelRequest } from '@vercel/node';
import MempoolJS from '@cell-studio/mempool.js';
import { z } from 'zod';

const MempoolProps = z.object({
  url: z.string().default('https://cell.mempool.space'),
  network: z.enum(['mainnet', 'testnet', 'signet', 'testnet4']).default('testnet'),
});

export function setupMempool(req: VercelRequest) {
  const query = MempoolProps.parse(req.query);

  const url = new URL(query.url);
  const mempool = MempoolJS({
    hostname: url.hostname,
    network: query.network,
  });

  return {
    mempool,
  };
}

/**
 * Transform mempool fee from sat/vb to sat/kvb, a simple formula of `fee * 1000`.
 * Note that the minimum fee on lightning network is 253 sat/kw, so this function's minimum return is 1011.
 */
export function fromMempoolFee(mempoolFee: number): number {
  return Math.max(mempoolFee * 1000, 1011);
}

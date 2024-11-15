import type { FeesRecommended } from '@cell-studio/mempool.js/lib/interfaces/bitcoin/fees';
import type { VercelRequest } from '@vercel/node';
import MempoolJS from '@cell-studio/mempool.js';
import { z } from 'zod';

export interface FeesRecommendedWithEcoFee extends FeesRecommended {
  economyFee: number;
}

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
    query,
    mempool,
  };
}

/**
 * Transform mempool fee from sat/vb to sat/kvb, a simple formula of `fee * 1000`.
 * Note that the minimum fee on lightning network is 253 sat/kw, so this function's minimum return is 1012.
 */
export function fromMempoolFee(mempoolFee: number): number {
  return Math.max(mempoolFee * 1000, 1012);
}

/**
 * Make sure "economyFee" is present in the FeesRecommended object.
 * If not, calculate it as 2x the minimumFee.
 */
export function fromRecommendedFees(fees: FeesRecommended): FeesRecommendedWithEcoFee {
  if ('economyFee' in fees) {
    return fees as FeesRecommendedWithEcoFee;
  } else {
    return {
      ...fees,
      economyFee: Math.min(fees.minimumFee * 2, fees.hourFee),
    };
  }
}

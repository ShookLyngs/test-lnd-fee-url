import type { FeesMempoolBlocks, FeesRecommended } from '@cell-studio/mempool.js/lib/interfaces/bitcoin/fees';
import type { MempoolReturn } from '@cell-studio/mempool.js/lib/interfaces';
import type { VercelRequest } from '@vercel/node';
import MempoolJS from '@cell-studio/mempool.js';
import { z } from 'zod';

export interface RecommendedFees extends FeesRecommended {
  economyFee: number;
}

const MempoolProps = z.object({
  url: z.string().default('https://mempool.space'),
  network: z.enum(['mainnet', 'testnet', 'signet', 'testnet4']).default('testnet'),
});

export class MempoolService {
  public readonly url: URL;
  public readonly mempool: MempoolReturn;

  private defaultFee = 1;

  constructor(url: string, network: string) {
    this.url = new URL(url);
    this.mempool = MempoolJS({
      hostname: this.url.hostname,
      network,
    });
  }

  static fromRequest(req: VercelRequest) {
    const query = MempoolProps.parse(req.query);
    return new MempoolService(query.url, query.network);
  }

  getBlocksTipHash() {
    return this.mempool.bitcoin.blocks.getBlocksTipHash();
  }

  getFeesMempoolBlocks() {
    return this.mempool.bitcoin.fees.getFeesMempoolBlocks();
  }

  async getFeesRecommended() {
    try {
      const fees = await this.mempool.bitcoin.fees.getFeesRecommended();
      return this.toIncludeEcoFee(fees);
    } catch (e) {
      console.error('Failed to fetch mempool.bitcoin.fees.getFeesRecommended():', e);
      return this.calculateRecommendedFees();
    }
  }

  // https://github.com/mempool/mempool/blob/dbd4d152ce831859375753fb4ca32ac0e5b1aff8/backend/src/api/fee-api.ts#L77
  private roundUpToNearest(value: number, nearest: number): number {
    return Math.ceil(value / nearest) * nearest;
  }

  // https://github.com/mempool/mempool/blob/dbd4d152ce831859375753fb4ca32ac0e5b1aff8/backend/src/api/fee-api.ts#L65
  private optimizeMedianFee(
    pBlock: FeesMempoolBlocks,
    nextBlock: FeesMempoolBlocks | undefined,
    previousFee?: number,
  ): number {
    const useFee = previousFee ? (pBlock.medianFee + previousFee) / 2 : pBlock.medianFee;
    if (pBlock.blockVSize <= 500000) {
      return this.defaultFee;
    }
    if (pBlock.blockVSize <= 950000 && !nextBlock) {
      const multiplier = (pBlock.blockVSize - 500000) / 500000;
      return Math.max(Math.round(useFee * multiplier), this.defaultFee);
    }
    return this.roundUpToNearest(useFee, this.defaultFee);
  }

  // https://github.com/mempool/mempool/blob/dbd4d152ce831859375753fb4ca32ac0e5b1aff8/backend/src/api/fee-api.ts#L22
  private async calculateRecommendedFees(): Promise<RecommendedFees> {
    const pBlocks = await this.getFeesMempoolBlocks();
    const minimumFee = this.defaultFee;
    const defaultMinFee = this.defaultFee;

    if (!pBlocks.length) {
      return {
        fastestFee: defaultMinFee,
        halfHourFee: defaultMinFee,
        hourFee: defaultMinFee,
        economyFee: minimumFee,
        minimumFee: minimumFee,
      };
    }

    const firstMedianFee = this.optimizeMedianFee(pBlocks[0], pBlocks[1]);
    const secondMedianFee = pBlocks[1]
      ? this.optimizeMedianFee(pBlocks[1], pBlocks[2], firstMedianFee)
      : this.defaultFee;
    const thirdMedianFee = pBlocks[2]
      ? this.optimizeMedianFee(pBlocks[2], pBlocks[3], secondMedianFee)
      : this.defaultFee;

    let fastestFee = Math.max(minimumFee, firstMedianFee);
    let halfHourFee = Math.max(minimumFee, secondMedianFee);
    let hourFee = Math.max(minimumFee, thirdMedianFee);
    const economyFee = Math.max(minimumFee, Math.min(2 * minimumFee, thirdMedianFee));

    fastestFee = Math.max(fastestFee, halfHourFee, hourFee, economyFee);
    halfHourFee = Math.max(halfHourFee, hourFee, economyFee);
    hourFee = Math.max(hourFee, economyFee);

    return {
      fastestFee: fastestFee,
      halfHourFee: halfHourFee,
      hourFee: hourFee,
      economyFee: economyFee,
      minimumFee: minimumFee,
    };
  }

  toIncludeEcoFee(fees: FeesRecommended): RecommendedFees {
    if ('economyFee' in fees) {
      return fees as RecommendedFees;
    } else {
      return {
        ...fees,
        economyFee: Math.min(fees.minimumFee * 2, fees.hourFee),
      };
    }
  }
}

/**
 * Transform mempool fee from sat/vb to msat/vb, a simple formula of `fee * 1000`.
 * Note that the minimum fee on lightning network is 253 sat/kw, which is 1012 msat/vb.
 */
export function toMsatPerVb(satPerVb: number): number {
  return Math.max(satPerVb * 1000, 1012);
}

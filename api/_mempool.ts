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

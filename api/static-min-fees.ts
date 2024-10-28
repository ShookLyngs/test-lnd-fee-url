import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.json({
    "current_block_hash": "000000000000000000006bc6b05711f10caa17a20be49f0a06067af582722543",
    "fee_by_block_target": {
      "2": 1012,
      "3": 1012,
      "4": 1012,
      "5": 1012,
      "6": 1012,
      "25": 1012
    },
    "min_relay_feerate": 1012
  });
}

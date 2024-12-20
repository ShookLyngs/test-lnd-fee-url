import type { VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';

export function returnError(res: VercelResponse, e: any) {
  if (e instanceof ZodError) {
    const firstError = e.errors[0];
    res.status(400).send({
      error: {
        code: 400,
        message: `${firstError.message} (${firstError.code})`,
      },
    });
  } else {
    res.status(500).send({
      error: {
        code: e?.code ?? e.status ?? null,
        message: e?.message ?? 'internal server error',
      },
    });
  }

  throw e;
}

import type { VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';

export function returnError(res: VercelResponse, e: any) {
  if (e instanceof ZodError) {
    const firstError = e.errors[0];
    res.status(400).send({
      error: {
        code: firstError.code ?? 400,
        message: `(${firstError.path.join('.')}): ${firstError.message}`,
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

import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    req,
    res,
    // TODO: Add user authentication context
    user: null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/api/echo', (c) => {
  const query = c.req.query();
  return c.json({ message: 'hono typescript service', query });
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Hono server running on http://localhost:${port}`);

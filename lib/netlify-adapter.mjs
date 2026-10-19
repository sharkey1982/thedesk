// Runs Vercel-style (req, res) handlers as modern Netlify Functions.
import { Readable } from 'node:stream';

export function adapt(handler, vercelConfig) {
  const parseBody = vercelConfig?.api?.bodyParser !== false;
  return async (request, context) => {
    const url = new URL(request.url);
    const buf = ['GET', 'HEAD'].includes(request.method) ? Buffer.alloc(0) : Buffer.from(await request.arrayBuffer());
    const headers = {};
    request.headers.forEach((v, k) => { headers[k] = v; });
    headers.host ??= url.host;
    headers['x-forwarded-proto'] ??=url.protocol.replace(':', '');
    if (context?.ip) headers['x-forwarded-for'] ??= context.ip;
    if (!headers['content-length']) headers['content-length'] = String(buf.length);

    const req = Readable.from(buf.length ? [buf] : []);
    Object.assign(req, {
      method: request.method,
      url: url.pathname + url.search,
      headers,
      query: Object.fromEntries(url.searchParams),
      socket: { remoteAddress: context?.ip },
      connection: { remoteAddress: context?.ip },
    });
    if (parseBody && buf.length) {
      const ct = headers['content-type'] || '';
      const text = buf.toString('utf8');
      if (ct.includes('application/json')) { try { req.body = JSON.parse(text); } catch { req.body = undefined; } }
      else if (ct.includes('application/x-www-form-urlencoded')) req.body = Object.fromEntries(new URLSearchParams(text));
      else req.body = text;
    }

    return await new Promise((resolve, reject) => {
      const out = new Headers();
      let status = 200, done = false;
      const finish = body => { if (done) return; done = true; resolve(new Response(status === 204 || status === 304 ? null : body ?? null, { status, headers: out })); };
      const res = {
        statusCode: 200,
        status(code) { status = code; this.statusCode = code; return this; },
        setHeader(k, v) { out.delete(k); (Array.isArray(v) ? v : [v]).forEach(x => out.append(k, String(x))); return this; },
        getHeader(k) { return out.get(k); },
        removeHeader(k) { out.delete(k); },
        json(obj) { if (!out.has('content-type')) out.set('content-type', 'application/json; charset=utf-8'); finish(JSON.stringify(obj)); return this; },
        send(body) {
          if (body !== null && typeof body === 'object' && !Buffer.isBuffer(body)) return this.json(body);
          if (typeof body === 'string' && !out.has('content-type')) out.set('content-type', 'text/html; charset=utf-8');
          finish(body); return this;
        },
        end(body) { finish(body); return this; },
        redirect(a, b) { const [code, loc] = typeof a === 'number' ? [a, b] : [307, a]; status = code; out.set('location', loc); finish(null); return this; },
      };
      Object.defineProperty(res, 'headersSent', { get: () => done });
      Promise.resolve(handler(req, res))
        .then(() => { if (!done) finish(null); })
        .catch(err => { console.error('handler error', err); if (!done) { status = 500; finish(JSON.stringify({ error: 'Internal error' })); } else reject(err); });
    });
  };
}

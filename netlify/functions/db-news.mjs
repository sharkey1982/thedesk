import handler, * as mod from '../../api/db-news.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/db-news' };

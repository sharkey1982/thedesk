import handler, * as mod from '../../api/full-cycle.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/full-cycle' };

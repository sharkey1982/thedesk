import handler, * as mod from '../../api/verify-checkout.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/verify-checkout' };

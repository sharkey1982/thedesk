import handler, * as mod from '../../api/practitioner-review.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/practitioner-review' };

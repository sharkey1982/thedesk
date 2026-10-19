import handler, * as mod from '../../api/assessment-result.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/assessment-result' };

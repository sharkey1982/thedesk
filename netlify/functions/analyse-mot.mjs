import handler, * as mod from '../../api/analyse-mot.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/analyse-mot' };

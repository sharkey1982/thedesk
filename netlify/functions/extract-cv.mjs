import handler, * as mod from '../../api/extract-cv.js';
import { adapt } from '../../lib/netlify-adapter.mjs';
export default adapt(handler, mod.config);
export const config = { path: '/api/extract-cv' };

import PocketBase from 'pocketbase';
import { CONFIG } from './config';
const pb = new PocketBase(CONFIG.POCKETBASE_URL);
export default pb;

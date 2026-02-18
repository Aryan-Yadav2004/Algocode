import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const ATLAS_DB_URL = process.env.ATLAS_DB_URL;
const NODE_ENV = process.env.NODE_ENV;
const PROBLEM_ADMIN_SERVICE_URL = process.env.PROBLEM_ADMIN_SERVICE_URL;
export {
    PORT, REDIS_HOST, REDIS_PORT, ATLAS_DB_URL, NODE_ENV, PROBLEM_ADMIN_SERVICE_URL
}
import { MongoClient } from 'mongodb';
import dot from 'dotenv';

const process = dot.config().parsed;
const connectionString = process.MONGO_CONNECTION_STRING;

const client = new MongoClient(connectionString);
let conn;
try {
    conn = await client.connect();
} catch (e) {
    console.log(e);
}

let db = conn.db("Leetcode");

export default db;
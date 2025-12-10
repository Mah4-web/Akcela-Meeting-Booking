import pg from "pg"; //we need to install the pg package

const dbConnectionString = process.env.DATABASE_URL;

export const db = new pg.Pool({
    connectionString: dbConnectionString,
});
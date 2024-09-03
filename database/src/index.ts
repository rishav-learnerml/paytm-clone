import { Client } from "pg";
import { FIND_USER_BY_EMAIL, INSERT_INTO_USERS } from "./query";

import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.POSTGRES_URI,
});

const createTableUsers = async () => {
  await client.connect();
  const result = await client.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        `);

  console.log(result);
};

const insertIntoUsers = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const data = [username, email, password];
    await client.query(INSERT_INTO_USERS, data);
    console.log("succesfully inserted to db!");
  } catch (error) {
    console.error("Something went wrong!", error);
  } finally {
    // client.end();
  }
};

const getUserByEmail = async (email: string) => {
  try {
    const data = [email];
    const res = await client.query(FIND_USER_BY_EMAIL, data);
    if (res.rows.length > 0) {
      console.log("Found User!", res.rows[0]);
    } else {
      console.log("User Not Found");
    }
  } catch (error) {
    console.error("Something went wrong!", error);
  } finally {
    // client.end();
  }
};

createTableUsers();
insertIntoUsers("Rasmit Chatterjee", "criv01@gmail.com", "pass12345");
getUserByEmail("criv01@gmail.com");

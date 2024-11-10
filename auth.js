
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();
const MASTER_KEY = process.env.MASTER_KEY;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'thegrail',
    port: 8889
};


export async function registerUser(username, password, keyVersion) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(
            'CALL RegisterUser(?, ?, ?, ?)',
            [username, password, MASTER_KEY, keyVersion]
        );
        console.log("User registered successfully.");
    } catch (error) {
        console.error("Error registering user:", error.message);
    } finally {
        await connection.end();
    }
}


export async function loginUser(username, password) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const [rows] = await connection.execute(
            'CALL LoginUser(?, ?, ?)',
            [username, password, MASTER_KEY]
        );
        console.log(rows[0]?.[0]?.message || "Unknown error.");
        return rows[0]?.[0]?.message;
    } catch (error) {
        console.error("Error logging in:", error.message);
    } finally {
        await connection.end();
    }
}


export async function rotateKey(oldKey, newKey, newKeyVersion) {
    const connection = await mysql.createConnection(dbConfig);
    try {
        await connection.execute(
            'CALL RotateKey(?, ?, ?)',
            [oldKey, newKey, newKeyVersion]
        );
        console.log("Key rotation completed successfully.");
    } catch (error) {
        console.error("Error rotating keys:", error.message);
    } finally {
        await connection.end();
    }
}

import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // ค่าเริ่มต้นของ XAMPP คือว่างเปล่า
  database: 'timeline_journal',
};

export async function query({ query, values = [] }) {
  const db = await mysql.createConnection(dbConfig);
  try {
    const [results] = await db.execute(query, values);
    return results;
  } catch (error) {
    throw Error(error.message);
  } finally {
    await db.end();
  }
}

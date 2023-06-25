/**
 * Module handles database management
 *
 * The sample data is for a chat log with one table:
 * Messages: id + message text
 */

const fs = require("fs");
const dbFile = "./data/chat.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
const casual = require("casual");
let db;

//SQLite wrapper for async / await connections https://www.npmjs.com/package/sqlite
dbWrapper
  .open({
    filename: dbFile,
    driver: sqlite3.Database,
  })
  .then(async (dBase) => {
    db = dBase;

    try {
      if (!exists) {
        throw new Error("Not Exist Db");

      }
    } catch (dbError) {
      console.error(dbError);
    }
  });

// Server script calls these methods to connect to the db
module.exports = {
  // Get the messages in the database
  getMessages: async () => {
    try {
      return await db.all("SELECT * from Messages");
    } catch (dbError) {
      console.error(dbError);
    }
  },

  getMessagesById: async (id) => {
    try {
      const data = await db.all("SELECT * FROM Messages WHERE id = ?", [id]);
      return data[0]
    } catch (dbError) {
      console.error(dbError);
      return null;
    }
  },
};

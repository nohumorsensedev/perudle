const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./words.db');

const getWords = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM words', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const addWord = (word) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO words (word) VALUES (?)', [word], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

module.exports = { getWords, addWord };

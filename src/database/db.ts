
//faz a conexão com o banco de dados
export async function initializeDatabase(database: any) {

    try {
        await database.execAsync(` CREATE TABLE IF NOT EXISTS music(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            tone TEXT NOT NULL,
            notes TEXT NOT NULL,
            favorite BOOLEAN DEFAULT FALSE NOT NULL
        );`);
    } catch (error) {
        console.error('Error initializing database', error);

    }
}

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

        // Adiciona a coluna isMinor se ela não existir (migração)
        try {
            await database.execAsync(`ALTER TABLE music ADD COLUMN isMinor BOOLEAN DEFAULT FALSE NOT NULL;`);
            console.log('Column isMinor added successfully');
        } catch (alterError: any) {
            // Se o erro for "duplicate column name", significa que a coluna já existe
            if (!alterError.message.includes('duplicate column name')) {
                console.error('Error adding isMinor column:', alterError);
            }
        }

        // Adiciona a coluna ordem se ela não existir (migração)
        try {
            await database.execAsync(`ALTER TABLE music ADD COLUMN ordem INTEGER DEFAULT 0;`);
            console.log('Column ordem added successfully');
        } catch (alterError: any) {
            // Se o erro for "duplicate column name", significa que a coluna já existe
            if (!alterError.message.includes('duplicate column name')) {
                console.error('Error adding ordem column:', alterError);
            } else {
                console.log('Column ordem already exists');
            }
        }

        // Inicializa a ordem para músicas que têm ordem = 0 ou NULL
        try {
            await database.execAsync(`
                UPDATE music 
                SET ordem = (
                    SELECT ROW_NUMBER() OVER (ORDER BY id) 
                    FROM music m2 
                    WHERE m2.id = music.id
                ) 
                WHERE ordem IS NULL OR ordem = 0;
            `);
            console.log('Ordem initialized for existing music');
        } catch (initError: any) {
            console.error('Error initializing ordem:', initError);
        }
        
    } catch (error) {
        console.error('Error initializing database', error);

    }
}
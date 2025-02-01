import { useSQLiteContext } from "expo-sqlite";

export function useMusicDatabase() {

    const db = useSQLiteContext();

    const getMusic = async () => {
        try {
            const result = await db.getAllAsync('SELECT * FROM music');
            return result;
        } catch (error) {
            console.error('Error getting music', error);
        }
    }

    const getMusicById = async (id:number) => {
        try {
            const result = await db.getAllAsync('SELECT * FROM music WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error getting music by id', error);
        }
    }

    const saveMusic = async (title: string, tone: string, notes: string) => {
        try {
            const query = 'INSERT INTO music (title, tone, notes) VALUES (?, ?, ?)';
            const params = [title, tone, notes];
            await db.runAsync(query, params);
            console.log('Music saved successfully');
        } catch (error) {
            console.error('Error saving music', error);
        }
    }

    return { getMusic, getMusicById,saveMusic }

}

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

    const getMusicById = async (id: number) => {
        try {
            const result = await db.getAllAsync('SELECT * FROM music WHERE id = ?', [id]);
            return result;
        } catch (error) {
            console.error('Error getting music by id', error);
            throw error;
        }
    }

    const saveMusic = async (title: string, tone: string, notes: string) => {
        try {
            const query = 'INSERT INTO music (title, tone, notes) VALUES (?, ?, ?)';
            const params = [title, tone, notes];
            await db.runAsync(query, params);
        } catch (error) {
            console.error('Error saving music', error);
            throw error;
        }
    }

    const editMusic = async (id: number, title: string, tone: string, notes: string) => {
        try {
            const query = 'UPDATE music SET title = ?, tone = ?, notes = ? WHERE id = ?';
            const params = [title, tone, notes, id];
            await db.runAsync(query, params);
        } catch (error) {
            console.error('Error updating music', error);
            throw error;
        }
    }

    const updateFavorite = async (id: number, favorite: boolean) => {
        try {
            const query = 'UPDATE music SET favorite = ? WHERE id = ?';
            const params = [favorite, id];
            await db.runAsync(query, params);
            console.log('Favorite updated successfully');
        } catch (error) {
            console.error('Error updating favorite', error);
        }
    };


    const getMusicFavorite = async () => {
        try {
            const result = await db.getAllAsync('SELECT * FROM music WHERE favorite = ?', [true]);
            return result;
        } catch (error) {
            console.error('Error getting favorite music', error);
        }
    };

    const deleteMusic = async (id: number) => {
        try {
            const query = 'DELETE FROM music WHERE id = ?';
            await db.runAsync(query, [id]);
        } catch (error) {
            console.error('Error deleting music', error);
            throw error;
            
        }
    }

    return { getMusic, getMusicById, saveMusic, editMusic, updateFavorite, getMusicFavorite, deleteMusic };

}

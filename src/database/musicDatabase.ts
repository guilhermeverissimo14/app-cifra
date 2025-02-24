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

    return { getMusic, getMusicById,saveMusic, updateFavorite, getMusicFavorite };

}

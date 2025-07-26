import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

export function useMusicDatabase() {

    const db = useSQLiteContext();

    const getMusic = async () => {
        try {
            const result = await db.getAllAsync('SELECT * FROM music');
            return result;
        } catch (error) {
            console.error('Error getting music', error);
            throw error;
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

    const saveMusic = async (title: string, tone: string, notes: string, isMinor: boolean = false) => {
        try {
            // Obtém o próximo valor de ordem (maior valor + 1)
            const result = await db.getAllAsync<{ maxOrdem: number }>('SELECT MAX(ordem) as maxOrdem FROM music');
            const maxOrdem = result[0]?.maxOrdem || 0;
            const novaOrdem = maxOrdem + 1;
            
            const query = 'INSERT INTO music (title, tone, notes, isMinor, ordem) VALUES (?, ?, ?, ?, ?)';
            const params = [title, tone, notes, isMinor, novaOrdem];
            await db.runAsync(query, params);
            console.log('Music saved successfully with ordem:', novaOrdem);
        } catch (error) {
            console.error('Error saving music', error);
            throw error;
        }
    }

    const editMusic = async (id: number, title: string, tone: string, notes: string, isMinor: boolean = false) => {
        try {
            const query = 'UPDATE music SET title = ?, tone = ?, notes = ?, isMinor = ? WHERE id = ?';
            const params = [title, tone, notes, isMinor, id];
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
            const result = await db.getAllAsync('SELECT * FROM music WHERE favorite = ? ORDER BY ordem ASC, id ASC', [true]);
            return result;
        } catch (error) {
            console.error('Error getting favorite music', error);
        }
    };

    const updateFavoriteOrder = async (musicIds: number[]) => {
        try {
            // Atualiza a ordem de cada música favorita baseada na posição
            for (let i = 0; i < musicIds.length; i++) {
                const query = 'UPDATE music SET ordem = ? WHERE id = ?';
                const params = [i + 1, musicIds[i]]; // Começar ordem em 1
                await db.runAsync(query, params);
            }
            console.log('Favorite order updated successfully');
        } catch (error) {
            console.error('Error updating favorite order', error);
            throw error;
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

    return { getMusic, getMusicById, saveMusic, editMusic, updateFavorite, getMusicFavorite, updateFavoriteOrder, deleteMusic };

}

import { useSQLiteContext } from "expo-sqlite";

export function musicDatabase(){

    const db = useSQLiteContext();

    const  getMusic = async () => {
        try {
            const result = await db.getEachAsync('SELECT * FROM music');
            return result;
        } catch (error) {
            console.error('Error getting music', error);
        }
    }

}
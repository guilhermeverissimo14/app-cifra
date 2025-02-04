import { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";

import { useMusicDatabase } from "@/src/database/musicDatabase";
import { MusicType } from ".";
import { MusicCard } from "@/src/components/musicCard/musicCard";
import { useRouter } from "expo-router";

export default function Favorite() {

    const { getMusicFavorite } = useMusicDatabase();

    const router = useRouter();

    const [musicFavorite, setMusicFavorite] = useState<MusicType[]>([]);

    async function getFavorites() {
        const result = await getMusicFavorite();
        setMusicFavorite(result as MusicType[]);
    }

    useEffect(() => {
        getFavorites();
        // console.log(musicFavorite.length > 0)
    })

    return (
        <View style={styles.container}>

            <Text style={styles.text}>Musicas Favoritas:</Text>

            {musicFavorite.length > 0 && musicFavorite.map((item) => (
                <MusicCard
                    navigation={() => { router.push(`/listMusic/${item.id}` as any) }}
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    tone={item.tone}
                    notes={item.notes}
                    favorite={item.favorite}
                />
            ))}

            {musicFavorite.length === 0 && (
                <View style={styles.musicNotFound}>
                    <Text style={styles.textNotFound}>Nenhuma musica favoritada...</Text>
                </View>
            )}

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 10,
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333"
    },
    musicNotFound: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    textNotFound: {
        fontSize: 18,
        fontWeight: 600,
        color: "#333"
    }
})
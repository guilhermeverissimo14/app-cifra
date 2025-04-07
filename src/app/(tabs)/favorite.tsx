import { useCallback, useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";

import { useMusicDatabase } from "@/src/database/musicDatabase";
import { MusicType } from ".";
import { MusicCard } from "@/src/components/musicCard/musicCard";
import { useFocusEffect, useRouter } from "expo-router";

export default function Favorite() {
    const { getMusicFavorite } = useMusicDatabase();
    const router = useRouter();
    const [musicFavorite, setMusicFavorite] = useState<MusicType[]>([]);

    async function getFavorites() {
        const result = await getMusicFavorite();
        setMusicFavorite(result as MusicType[]);
    }

    useFocusEffect(
        useCallback(() => {
            getFavorites();
        }, [])
    );

    const handleFavoriteToggle = async () => {
        await getFavorites();
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<MusicType>) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag} 
                disabled={isActive}
                activeOpacity={1}
                style={[styles.draggableItem, { opacity: isActive ? 0.8 : 1 }]}
            >

                <MusicCard
                    deleteIcon={false}
                    navigation={() => router.push(`/listMusic/${item.id}`)}
                    id={item.id}
                    title={item.title}
                    tone={item.tone}
                    favorite={item.favorite}
                    onFavoriteToggle={handleFavoriteToggle} 
                />
            </TouchableOpacity>
        </ScaleDecorator>
    );



    return (
        <View style={styles.container}>
            <Text style={styles.text}>Músicas Favoritas:</Text>

            {musicFavorite.length > 0 ? (
                <DraggableFlatList
                    data={musicFavorite}
                    keyExtractor={(item) => item.id.toString()}
                    onDragEnd={({ data }) => setMusicFavorite(data)}
                    renderItem={renderItem}
                    activationDistance={10}
                />

            ) : (
                <View style={styles.musicNotFound}>
                    <Text style={styles.textNotFound}>Nenhuma música favoritada...</Text>
                </View>
            )}
        </View>
    );
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
        color: "#333",
    },
    musicNotFound: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center", 
    },
    textNotFound: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    draggableItem: {
        marginBottom: 10,
    },
});

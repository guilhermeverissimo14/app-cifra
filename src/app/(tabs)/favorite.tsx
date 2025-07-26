import { useCallback, useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from "react-native-draggable-flatlist";

import { useMusicDatabase } from "@/src/database/musicDatabase";
import { MusicType } from ".";
import { MusicCard } from "@/src/components/musicCard/musicCard";
import { useFocusEffect, useRouter } from "expo-router";

export default function Favorite() {
    const { getMusicFavorite, updateFavoriteOrder } = useMusicDatabase();
    const router = useRouter();
    const [musicFavorite, setMusicFavorite] = useState<MusicType[]>([]);

    async function getFavorites() {
        try {
            const result = await getMusicFavorite();
            const sortedResult = (result as MusicType[]).sort((a, b) => {
                // Ordena por 'ordem' primeiro, depois por 'id' como fallback
                if (a.ordem !== b.ordem) {
                    return a.ordem - b.ordem;
                }
                return a.id - b.id;
            });
            setMusicFavorite(sortedResult);
        } catch (error) {
            console.error('Error getting favorites:', error);
        }
    }

    const handleDragEnd = async ({ data }: { data: MusicType[] }) => {
        setMusicFavorite(data);
        // Salva a nova ordem no banco de dados
        const musicIds = data.map(item => item.id);
        try {
            await updateFavoriteOrder(musicIds);
            console.log('Order updated successfully for favorites');
        } catch (error) {
            console.error('Error updating favorite order:', error);
            // Recarrega a lista em caso de erro
            await getFavorites();
        }
    };

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
                    navigation={() => { router.push(`/listMusic/${item.id}` as any) }}
                    id={item.id}
                    title={item.title}
                    tone={item.tone}
                    favorite={item.favorite}
                    isMinor={item.isMinor}
                    onFavoriteToggle={handleFavoriteToggle}
                />
            </TouchableOpacity>
        </ScaleDecorator>
    );



    return (
        <View style={styles.container}>
            <Text style={styles.text}>Músicas Favoritas</Text>

            {musicFavorite.length > 0 ? (
                <DraggableFlatList
                    data={musicFavorite}
                    keyExtractor={(item) => item.id.toString()}
                    onDragEnd={handleDragEnd}
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
        backgroundColor: "#101323",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight! + 20,
    },
    text: {
        fontSize: 20,
        fontFamily: "SplineSans-Bold",
        paddingTop: 52,
        paddingBottom: 16,
        color: "white",
        marginBottom: 32
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

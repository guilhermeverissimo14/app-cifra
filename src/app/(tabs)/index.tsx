import { Text, StyleSheet, View, Platform, StatusBar, ScrollView, TextInput } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';


import { useMusicDatabase } from '@/src/database/musicDatabase';
import { MusicCard } from '@/src/components/musicCard/musicCard';


export interface MusicType {
  id: number;
  title: string;
  tone: string;
  notes: string;
  favorite: boolean;
}

export default function HomeScreen() {


  const router = useRouter();

  const musicDatabase = useMusicDatabase();

  const [music, setMusic] = useState<MusicType[]>([]);

  async function getMusic() {
    const result = await musicDatabase.getMusic();
    setMusic(result as MusicType[]);
  }

  useFocusEffect(
    useCallback(() => {
      getMusic();
    }, [])
  );

  const handleFavoriteToggle = async () => {
    await getMusic();
  }


  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Todas as musicas:
      </Text>

      <TextInput
        style={styles.inputSearch}
        onChangeText={(text) => {
          if (text.length > 0) {
            const filteredMusic = music.filter(item => item.title.toLowerCase().includes(text.toLowerCase()));
            setMusic(filteredMusic);
          } else {
            getMusic();
          }
        }}
      />

      {music.length > 0 ? (
        <ScrollView>
          {music.map((item) => (
            <MusicCard
              navigation={() => { router.push(`/listMusic/${item.id}` as any) }}
              key={item.id}
              id={item.id}
              title={item.title}
              tone={item.tone}
              deleteIcon={true}
              favorite={item.favorite}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.musicNotFound}>
          <Text style={styles.textNotFound}>Nenhuma musica encontrada...</Text>
        </View>
      )}

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101323",
    alignItems: "center",
  },
  inputSearch: {
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: "#21284a",
    color: "#8e99cc",
    borderRadius: 8,
    width: "90%",
    paddingLeft: 8,
  },
  text: {
    fontSize: 20,
    color: "white",
    fontFamily: 'SplineSans-Bold',
  },
  musicNotFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  textNotFound: {
    fontSize: 18,
    fontWeight: 600,
    color: "white",
  }
})



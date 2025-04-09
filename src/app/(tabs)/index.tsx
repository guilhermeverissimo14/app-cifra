import { Text, StyleSheet, View, Platform, StatusBar, ScrollView} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';


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

  useEffect(() => {
    getMusic();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Todas as musicas:
      </Text>

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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 10,
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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



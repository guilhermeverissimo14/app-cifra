import { Text, StyleSheet, View, Platform, StatusBar } from 'react-native';
import { useEffect, useState } from 'react';


import { useMusicDatabase } from '@/src/database/musicDatabase';
import { MusicCard } from '@/src/components/musicCard/musicCard';


interface MusicType {
  id: number;
  title: string;
  tone: string;
  notes: string;
}

export default function HomeScreen() {

  const musicDatabase = useMusicDatabase();

  const [music, setMusic] = useState<MusicType[]>([]);

  const [isFavorite, setFavorite] = useState(false);

  async function getMusic() {
    const result = await musicDatabase.getMusic();
    setMusic(result as MusicType[]);
  }

  useEffect(() => {
    getMusic();
  })

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Todas as musicas:
      </Text>

      {music.map((item) => (
        <MusicCard
          key={item.id}
          id={item.id}
          title={item.title}
          tone={item.tone}
          notes={item.notes}
          isFavorite={isFavorite}
          setFavorite={setFavorite}
        />
      ))}

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
})



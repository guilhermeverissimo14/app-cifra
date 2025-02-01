import { useMusicDatabase } from '@/src/database/musicDatabase';
import { useEffect, useState } from 'react';
import { Text, StyleSheet, View, Platform, StatusBar } from 'react-native';


interface MusicType {
  id: number;
  title: string;
  tone: string;
  notes: string;
}

export default function HomeScreen() {

  const musicDatabase = useMusicDatabase();

  const [music, setMusic] = useState<MusicType[]>([]);

   async function getMusic(){
      const result = await musicDatabase.getMusic();
      setMusic(result as MusicType[]);
    }
  
    useEffect(()=>{
      getMusic();
    })

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Todas as musicas:
      </Text>

      {music.map((item) => (
        <View style={styles.cardMusic} key={item.id}>
          <Text>{item.title}</Text>
          <Text>{item.tone}</Text>
          <Text>{item.notes}</Text>
        </View>
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

  cardMusic: {
    backgroundColor: '#d3d3d3',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
})



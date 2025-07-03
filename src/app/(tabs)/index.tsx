import { Text, StyleSheet, View, Platform, StatusBar, ScrollView, TextInput } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';


import { useMusicDatabase } from '@/src/database/musicDatabase';
import { MusicCard } from '@/src/components/musicCard/musicCard';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';


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
         Minhas musicas 
      </Text>

      <View style={styles.searchContainer}>
        <FontAwesomeIcon 
          icon={faSearch} 
          size={16} 
          color="#8e99cc" 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.inputSearch}
          placeholder="Search"
          placeholderTextColor="#8e99cc"
          onChangeText={(text) => {
            if (text.length > 0) {
              const filteredMusic = music.filter(item => 
                item.title.toLowerCase().includes(text.toLowerCase())
              );
              setMusic(filteredMusic);
            } else {
              getMusic();
            }
          }}
        />
      </View>

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
              onDeleteSuccess={getMusic}
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
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
  },
    searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#171c36",
    borderRadius: 8,
    width: "95%",
    marginVertical: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  inputSearch: {
    flex: 1,
    color: "#ffffff",
    fontFamily: 'SplineSans-Regular',
    fontSize: 16,
    padding: 8,
  },
  text: {
    marginTop: 16,
    marginBottom: 16,
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



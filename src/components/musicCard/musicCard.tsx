import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useMusicDatabase } from "@/src/database/musicDatabase";

interface MusicCardProps {
    id: number;
    title: string;
    tone: string;
    notes: string;
    favorite: boolean;
    navigation: any;
  }

export const MusicCard = ({id, title, tone, notes, favorite, navigation}:MusicCardProps)=>{
   
    const musicDatabase = useMusicDatabase();

    const handleFavoritePress = async () => {
        const newFavorite = !favorite;
        await musicDatabase.updateFavorite(id, newFavorite);
      }
   
    return(
        <TouchableOpacity onPress={navigation} style={styles.cardMusic} key={id}>

          <View style={styles.contentTexts}>
            <Text style={styles.textTitle}>{title}</Text>
            <Text style={styles.textDescription}>{tone}</Text>
            {/* <Text style={styles.textDescription}>{notes}</Text> */}
          </View>

          <Text>

            <TouchableOpacity onPress={handleFavoritePress}>
              {favorite ? (
                <FontAwesomeIcon icon={faHeart} size={32} color="brown" />
              ) : (
                <FontAwesomeIcon icon={faHeartRegular} size={32} color="brown" />
              )}
            </TouchableOpacity>

          </Text>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    contentTexts: {
      padding: 10,
    },
  
    textTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
  
    textDescription: {
      fontSize: 16,
      color: '#333',
    },
  
    cardMusic: {
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      backgroundColor: '#d3d3d3',
      padding: 10,
      margin: 10,
      borderRadius: 5,
      height: 80
    },
  });
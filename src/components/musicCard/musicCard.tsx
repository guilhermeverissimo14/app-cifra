import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

interface MusicCardProps {
    id: number;
    title: string;
    tone: string;
    notes: string;
    isFavorite: boolean;
    setFavorite: (value: boolean) => void;
  }

export const MusicCard = ({id, title, tone, notes, isFavorite, setFavorite}:MusicCardProps)=>{
    return(
        <View style={styles.cardMusic} key={id}>

          <View style={styles.contentTexts}>
            <Text style={styles.textTitle}>{title}</Text>
            <Text style={styles.textDescription}>{tone}</Text>
            <Text style={styles.textDescription}>{notes}</Text>
          </View>

          <Text>

            <TouchableOpacity onPress={() => setFavorite(!isFavorite)}>
              {isFavorite ? (
                <FontAwesomeIcon icon={faHeart} size={32} color="brown" />
              ) : (
                <FontAwesomeIcon icon={faHeartRegular} size={32} color="brown" />
              )}
            </TouchableOpacity>

          </Text>

        </View>
    )
}

const styles = StyleSheet.create({
    contentTexts: {},
  
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
    },
  });
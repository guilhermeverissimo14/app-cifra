import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faHeart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useMusicDatabase } from "@/src/database/musicDatabase";

interface MusicCardProps {
  id: number;
  title: string;
  tone: string;
  favorite: boolean;
  navigation?: any;
  deleteIcon: boolean;
  onFavoriteToggle?: () => void;
}

export const MusicCard = ({ id, title, tone, favorite, navigation, deleteIcon, onFavoriteToggle}: MusicCardProps) => {

  const musicDatabase = useMusicDatabase();

  const handleFavoritePress = async () => {
    const newFavorite = !favorite;
    await musicDatabase.updateFavorite(id, newFavorite);
    onFavoriteToggle?.();
  }

  const deleteMusic = async (id: number) => {
    try {
      Alert.alert(
        "Confirmação",
        "Tem certeza que deseja apagar essa música?",
        [
          {
            text: "cancelar",
            style: "cancel"
          },
          {
            text: "OK",
            onPress: async () => {
              await musicDatabase.deleteMusic(id);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting music', error);
    }
  }

  return (
    <View style={styles.cardMusic} key={id}>
      <View style={styles.contentTexts}>
        <Text style={styles.textTitle}>{title.length > 20 ? title.substring(0, 20) + '...' : title}</Text>
        <Text style={styles.textDescription}>{tone.length > 20 ? tone.substring(0, 20) + '...' : tone}</Text>
      </View>


      <View style={styles.boxActions}>



        {deleteIcon && (
          <TouchableOpacity onPress={() => deleteMusic(id)}>
            <FontAwesomeIcon icon={faTrash} size={25} color="gray" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={navigation}>
          <FontAwesomeIcon icon={faEye} size={25} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFavoritePress}>
          {favorite ? (
            <FontAwesomeIcon icon={faHeart} size={25} color="brown" />
          ) : (
            <FontAwesomeIcon icon={faHeartRegular} size={25} color="brown" />
          )}
        </TouchableOpacity>

      </View>


    </View>
  )
}

const styles = StyleSheet.create({
  contentTexts: {
    padding: 10,
  },

  boxActions: {
    width: '40%',
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
  gap: 20,
    alignItems: 'center',
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#d3d3d3',
    padding: 10,
    margin: 3,
    borderRadius: 5,
    height: 80
  },
});
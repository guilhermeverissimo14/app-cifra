import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faHeart, faMusic, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { useMusicDatabase } from "@/src/database/musicDatabase";
import { transform } from "@babel/core";

interface MusicCardProps {
  id: number;
  title: string;
  tone: string;
  favorite: boolean;
  navigation?: any;
  deleteIcon: boolean;
  onFavoriteToggle?: () => void;
  onDeleteSuccess?: () => void;
}

export const MusicCard = ({ id, title, tone, favorite, navigation, deleteIcon, onFavoriteToggle, onDeleteSuccess }: MusicCardProps) => {

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
              onDeleteSuccess?.();
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

      <View style={styles.boxIcons}>

        <View style={styles.icon}>
            <FontAwesomeIcon icon={faMusic} size={20} color="white" />
        </View>

        <View style={styles.contentTexts}>
          <Text style={styles.textTitle}>{title.length > 20 ? title.substring(0, 20) + '...' : title}</Text>
          <Text style={styles.textDescription}>{tone.length > 20 ? tone.substring(0, 20) + '...' : tone}</Text>
        </View>
      </View>



      <View style={styles.boxActions}>



        {deleteIcon && (
          <TouchableOpacity onPress={() => deleteMusic(id)}>
            <FontAwesomeIcon icon={faTrash} size={15} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={navigation}>
          <FontAwesomeIcon icon={faEye} size={15} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFavoritePress}>
          {favorite ? (
            <FontAwesomeIcon icon={faHeart} size={20} color="brown" />
          ) : (
            <FontAwesomeIcon icon={faHeartRegular} size={20} color="brown" />
          )}
        </TouchableOpacity>

      </View>


    </View>
  )
}

const styles = StyleSheet.create({

  boxIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#21284a",
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  contentTexts: {
  },

  boxActions: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
  },

  textTitle: {
    fontSize: 18,
    color: "white",
    fontFamily: "SplineSans-SemiBold",
  },

  textDescription: {
    fontSize: 16,
    color: "white",
    fontFamily: "SplineSans-Regular",
  },

  cardMusic: {
    width: '95%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: "#101323",
    marginBottom: 8,
    borderRadius: 8,
    borderColor: "#21284a",
    borderWidth: 1,
    padding: 8,
  },
});
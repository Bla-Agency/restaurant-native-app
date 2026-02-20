import { Restaurant } from '@/api/restaurants';
import { ThemedText } from '@/components/themed-text';
import { Colors, Space } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { CustomStarRating } from './CustomStarRating';

const GOOGLE_GEOCODE_KEY = 'AIzaSyDJmyIuXn00Mc1xlF4eVBQcZ5OT-wAsux4';

type Props = {
  data: Restaurant;
  isFavorite: boolean;
  hideComments?: boolean;
  variant?: 'default' | 'map';
  onToggleFavorite: (restaurant: Restaurant) => void;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
};

export const RestaurantCard = ({ data, isFavorite, hideComments, variant = 'default', onToggleFavorite, onPress, containerStyle, cardStyle }: Props) => {
  const navigation = useNavigation();
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  // Reverse geocode lat/lng to address when API doesn't provide one
  useEffect(() => {
    if (data.address?.trim()) {
      setResolvedAddress(null);
      return;
    }
    const lat = data.latlng?.lat;
    const lng = data.latlng?.lng;
    if (lat == null || lng == null) return;

    let cancelled = false;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_GEOCODE_KEY}&language=es`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.results?.[0]) return;
        setResolvedAddress(json.results[0].formatted_address ?? null);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [data._id, data.address, data.latlng?.lat, data.latlng?.lng]);

  const displayAddress = data.address?.trim() || resolvedAddress || null;
  const isMapVariant = variant === 'map';

  // Truncate address to 30 characters
  const truncateAddress = (address: string): string => {
    if (address.length <= 30) return address;
    return address.substring(0, 30) + '...';
  };

  const truncatedAddress = displayAddress ? truncateAddress(displayAddress) : null;

  return (
    <View style={[styles.container, isMapVariant && styles.containerMap, containerStyle]}>
      <View style={[styles.card, isMapVariant && styles.cardMap, cardStyle]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (onPress ? onPress() : (navigation as any).navigate('RestaurantDetail', { id: data._id }))}
          style={[styles.cardContent, isMapVariant && styles.cardContentMap]}
        >
          <Image source={{ uri: data.image }} style={[styles.image, isMapVariant && styles.imageMap]} />

          <View style={[styles.info, isMapVariant && styles.infoMap]}>

            <ThemedText style={styles.name} type="defaultSemiBold">{data.name}</ThemedText>
            {truncatedAddress ? (
              <ThemedText style={styles.description} >{truncatedAddress}</ThemedText>
            ) : null}


            <View style={styles.bottomRow}>
              <CustomStarRating
                rating={data?.avgRating || 0}
                size={isMapVariant ? 12 : 16}
              />
              <View>
                {!hideComments && <Text style={styles.price}>({data.reviews?.length} comentarios)</Text>}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={[styles.favoriteContainer, isMapVariant && styles.favoriteContainerMap]}>
          <TouchableOpacity
            style={[styles.favoriteButton, isMapVariant && styles.favoriteButtonMap]}
            onPress={() => onToggleFavorite(data)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerMap: {
    marginBottom: 0,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.light.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 80,
  },
  cardMap: {
    // add internal padding so content doesn't touch the border (map variant)
    borderRadius: 20,
    padding: Space.s,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContentMap: {
    // card already has padding in map variant
    alignItems: 'center',
  },
  favoriteContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  favoriteButton: {
    paddingVertical: 8,
  },
  favoriteButtonMap: {
    // remove top padding so heart aligns to top
    paddingTop: 0,
    paddingRight: 0,
    paddingLeft: Space.s,
    paddingBottom: Space.s,
  },
  image: {
    width: 80,
    height: 80,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
  },
  imageMap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    marginRight: 10,
  },
  info: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  infoMap: {
    padding: Space.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Robert-B',
  },
  description: {
    fontSize: 14,
    color: Colors.light.black,
    marginVertical: 2,
    fontFamily: 'Robert-R',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
  },
  favoriteContainerMap: {
    width: 44,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

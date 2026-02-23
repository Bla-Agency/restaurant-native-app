import type { Restaurant } from '@/types/index';
import React, { memo } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

interface MapMarkerProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onPress: (id: string) => void;
}

const MapMarkerComponent = ({ restaurant, isSelected, onPress }: MapMarkerProps) => {
  if (!restaurant.latlng || restaurant.latlng.lat === undefined || restaurant.latlng.lng === undefined) {
    return null;
  }

  // Android: use image prop (works fine, no blinking)
  if (Platform.OS === 'android') {
    return (
      <Marker
        coordinate={{
          latitude: restaurant.latlng.lat,
          longitude: restaurant.latlng.lng,
        }}
        anchor={{ x: 0.5, y: 1 }}
        image={
          isSelected
            ? require('../../assets/images/selected.png')
            : require('../../assets/images/default.png')
        }
        onPress={() => onPress(restaurant._id)}
      />
    );
  }

  // iOS: use custom view (prevents blinking)
  return (
    <Marker
      coordinate={{
        latitude: restaurant.latlng.lat,
        longitude: restaurant.latlng.lng,
      }}
      anchor={{ x: 0.5, y: 1 }}
      onPress={() => onPress(restaurant._id)}
    >
      <View style={styles.markerContainer}>
        <Image
          source={
            isSelected
              ? require('../../assets/images/selected.png')
              : require('../../assets/images/default.png')
          }
          style={styles.markerImage}
          resizeMode="contain"
        />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 40,
    height: 40,
  },
});

// Memoize the component to prevent unnecessary re-renders
// Only re-render if isSelected changes for this specific marker
export const MapMarker = memo(MapMarkerComponent, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected && prevProps.restaurant._id === nextProps.restaurant._id;
});

import { useDeleteRestaurantMutation, useRestaurantsQuery } from '@/api/restaurants';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, CornorRadius, Space } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import type { Restaurant } from '@/types/index';
import { MapIcon } from '@/utils/svgs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUser } from '../../storage/auth';
const PAGE_SIZE = 10;
const MAP_CARD_WIDTH = 350;
const MAP_CARD_MARGIN = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Calculate initial region based on restaurant locations
const getInitialRegion = (restaurants: Restaurant[]) => {
  // Default to Madrid if no restaurants
  if (!restaurants || restaurants.length === 0) {
    return {
      latitude: 40.4168,
      longitude: -3.7038,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  // Find first restaurant with valid coordinates
  const firstValid = restaurants.find(
    (r) => r.latlng && r.latlng.lat !== undefined && r.latlng.lng !== undefined
  );

  if (firstValid && firstValid.latlng) {
    return {
      latitude: firstValid.latlng.lat,
      longitude: firstValid.latlng.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  // Fallback to Madrid
  return {
    latitude: 40.4168,
    longitude: -3.7038,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
};

// Dark map style to match the app (background ~#1E242C)
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1E242C' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8f96' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1E242C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2E3742' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#3E4955' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#20262C' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#20262C' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2E3742' }] },
];

export default function RestaurantListScreen() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const { data, isLoading, error, isFetching } = useRestaurantsQuery(page, PAGE_SIZE);
 const [userId, setUserId] = useState<string>('');
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        const userData = JSON.parse(user);
        console.log("USER DATA:", userData);
        console.log("USER ID:", userData._id);
        console.log("USER EMAIL:", userData.email);
        setUserId(userData._id);
      }
    };
    fetchUser();
  }, []);
  console.log("data", data);
  console.log("userId", userId);



  const navigation = useNavigation();
  const deleteRestaurant = useDeleteRestaurantMutation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const mapRef = useRef<MapView | null>(null);
  const mapCardsScrollRef = useRef<FlatList<Restaurant> | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable | null>>(new Map());
  const total = data?.total ?? 0;
  const restaurantList = data?.restaurantList ?? [];
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const handleDeleteRestaurant = (item: Restaurant) => {
    Alert.alert(
      'Eliminar restaurante',
      `¿Eliminar "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            swipeableRefs.current.get(item._id)?.close();
            deleteRestaurant.mutate(item._id);
          },
        },
      ]
    );
  };

  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, _dragX: Animated.AnimatedInterpolation<number>, item: Restaurant) => {
  // Only show swipe actions if user owns the restaurant
  if (item.owner !== userId) {
    return null;
  }

  return (
    <View style={styles.swipeActionsRow}>
      <RectButton
        style={[styles.swipeActionBtn, styles.swipeActionEdit]}
        onPress={() => {
          swipeableRefs.current.get(item._id)?.close();
          console.log("Navigating to EditRestaurant with ID:", item._id, "Type:", typeof item._id);
          (navigation as any).navigate('EditRestaurant', { id: item._id });
        }}
      >
        <Ionicons name="pencil" size={22} color="#fff" />
        <Text style={styles.swipeActionText}>Editar</Text>
      </RectButton>
      <RectButton
        style={[styles.swipeActionBtn, styles.swipeActionDelete]}
        onPress={() => handleDeleteRestaurant(item)}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
        <Text style={styles.swipeActionText}>Eliminar</Text>
      </RectButton>
    </View>
  );
};
  const renderListItem = ({ item }: { item: Restaurant }) => (
    <Swipeable
      ref={(ref) => { if (ref) swipeableRefs.current.set(item._id, ref); }}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
    >
      <RestaurantCard
        data={item}
        isFavorite={isFavorite(item._id)}
        onToggleFavorite={() => toggleFavorite(item)}
      />
    </Swipeable>
  );

  const handleMapPress = () => setViewMode('map');
  const handleListPress = () => setViewMode('list');
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#264BEB" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ThemedText>Error al cargar restaurantes</ThemedText>
        </View>
      </View>
    );
  }

  const renderPaginationFooter = () => (
    <View style={styles.pagination}>
      <ThemedText style={styles.paginationLabel}>
        Página {page} de {totalPages} {total ? `(${total} restaurantes)` : ''}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.paginationNumbers}
      >
        {pageNumbers.map((num) => {
          const isActive = page === num;
          return (
            <TouchableOpacity
              key={num}
              onPress={() => !isFetching && setPage(num)}
              disabled={isFetching}
              style={[styles.pageNumTouchable, isActive && styles.pageNumTouchableActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageNumText, isActive && styles.pageNumTextActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ThemedView style={[styles.container, viewMode === 'map' && { overflow: 'visible' }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>{viewMode === 'map' ? 'Mapa' : 'Restaurantes'}</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleMapPress}>
            <MapIcon size={28} color={viewMode === 'map' ? '#000' : '#CCC'} />
            {/* <Ionicons name="map-" size={24} color={viewMode === 'map' ? '#000' : '#CCC'} /> */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleListPress}>
            <Ionicons name="list" size={24} color={viewMode === 'list' ? '#000' : '#CCC'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <View style={[styles.content, viewMode === 'map' && { overflow: 'visible' }]}>
        {viewMode === 'list' ? (
          <View style={styles.contentList}>
            <FlatList
              data={restaurantList}
              keyExtractor={(item) => item._id}
              renderItem={renderListItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={totalPages > 1 ? renderPaginationFooter : null}
            />
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              customMapStyle={DARK_MAP_STYLE}
              showsUserLocation
              showsMyLocationButton
              ref={mapRef}
              initialRegion={getInitialRegion(restaurantList)}
            >
              {restaurantList.map((restaurant: Restaurant) => {
                if (!restaurant.latlng || restaurant.latlng.lat === undefined || restaurant.latlng.lng === undefined) return null;
                const isSelected = selectedMarkerId === restaurant._id;
                return (
                  <Marker
                    key={`${restaurant._id}-${isSelected}`}
                    coordinate={{
                      latitude: restaurant.latlng.lat,
                      longitude: restaurant.latlng.lng,
                    }}
                    title={restaurant.name}
                    description={restaurant.address}
                    
                    // image={require('../../../assets/images/default.png')}
                    image={
                      
                      isSelected
                        ? require('../../../assets/images/selected.png')
                        : require('../../../assets/images/default.png')
                      
                    }
                    anchor={{ x: 0.5, y: 1 }}
                    onPress={() => {
                      setSelectedMarkerId(restaurant._id);
                      // Find index in the filtered list (restaurants with location)
                      const filteredList = restaurantList.filter(
                        (r) => r.latlng && r.latlng.lat != null && r.latlng.lng != null
                      );
                      const idx = filteredList.findIndex((r) => r._id === restaurant._id);
                      if (idx >= 0 && mapCardsScrollRef.current) {
                        // Use FlatList's scrollToIndex to center the card
                        mapCardsScrollRef.current.scrollToIndex({
                          index: idx,
                          animated: true,
                          viewPosition: 0.5, // Center the card
                        });
                      }
                    }}
                  />
                );
              })}
            </MapView>
            {/* Bottom overlay: horizontal scroll of restaurant cards */}
            <View style={styles.mapCardsOverlay} pointerEvents="box-none">
              <FlatList
                ref={mapCardsScrollRef}
                data={restaurantList.filter(
                  (r) => r.latlng && r.latlng.lat != null && r.latlng.lng != null
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.mapCardsScrollContent}
                snapToInterval={MAP_CARD_WIDTH + MAP_CARD_MARGIN}
                snapToAlignment="center"
                decelerationRate="fast"
                getItemLayout={(data, index) => ({
                  length: MAP_CARD_WIDTH + MAP_CARD_MARGIN,
                  offset: (MAP_CARD_WIDTH + MAP_CARD_MARGIN) * index,
                  index,
                })}
                renderItem={({ item: restaurant }) => {
                  const isSelected = selectedMarkerId === restaurant._id;
                  return (
                    <View style={styles.mapCardWrap}>
                      <RestaurantCard
                        data={restaurant}
                        hideComments={true}
                        variant="map"
                        isFavorite={isFavorite(restaurant._id)}
                        onToggleFavorite={() => toggleFavorite(restaurant)}
                        onPress={() => {
                          setSelectedMarkerId(restaurant._id);
                          if (mapRef.current && restaurant.latlng) {
                            mapRef.current.animateToRegion({
                              latitude: restaurant.latlng.lat,
                              longitude: restaurant.latlng.lng,
                              latitudeDelta: 0.05,
                              longitudeDelta: 0.05,
                            }, 500);
                          }
                        }}
                        containerStyle={styles.mapCardContainerOverride}
                        cardStyle={[styles.mapCardCardOverride, isSelected && styles.mapCardSelected]}
                      />
                    </View>
                  );
                }}
              />
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentList: {
    paddingHorizontal: Space.md,
  },
  contentMap: {
    paddingHorizontal: Space.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCardWrap: {
    width: MAP_CARD_WIDTH,
    marginRight: MAP_CARD_MARGIN,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    paddingHorizontal: 16,
    paddingTop: Space.lg
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.black,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeActionsRow: {
    flexDirection: 'row',
    width: 120,
    marginBottom: 16,
  },
  swipeActionWrap: {
    width: 60,
  },
  swipeActionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  swipeActionEdit: {
    backgroundColor: Colors.light.tailorBlue,
  },
  swipeActionDelete: {
    backgroundColor: '#E53935',
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.light.white,
    minHeight: 300,
    position: 'relative',
    borderTopLeftRadius: CornorRadius.CornorRadius,
    borderTopRightRadius: CornorRadius.CornorRadius,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapCardsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 0,
    paddingBottom: Space.xxl,
    paddingTop: 12,
  },
  mapCardsScroll: {
    flexGrow: 0,
  },
  mapCardsScrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - MAP_CARD_WIDTH) / 2,
  },
  mapCardContainerOverride: {
    marginBottom: 0,
    paddingHorizontal: 0,
    width: MAP_CARD_WIDTH,
  },
  mapCardCardOverride: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 20,
  },
  mapCardSelected: {
    borderColor: '#264BEB',
    backgroundColor: '#f0f4ff',
  },
  iconButton: {
    marginLeft: 30,
    borderRadius: 12,
  },
  listContent: {
    paddingBottom: 30,
  },
  pagination: {
    paddingVertical: Space.lg,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  paginationLabel: {
    fontSize: 14,
    color: '#687076',
    marginBottom: 16,
  },
  paginationNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pageNumTouchable: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  pageNumTouchableActive: {
    backgroundColor: '#264BEB',
    borderRadius: 18,
  },
  pageNumText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  pageNumTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
});
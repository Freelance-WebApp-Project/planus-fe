import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { usePlaces } from '../hooks/usePlace';
import { Place, PlaceType } from '../types/place.types';

interface PlaceListProps {
  onPlacePress?: (place: Place) => void;
  initialQuery?: {
    type?: PlaceType;
    city?: string;
    minRating?: number;
    tags?: string[];
  };
}

const PlaceList: React.FC<PlaceListProps> = ({ onPlacePress, initialQuery = {} }) => {
  const {
    places,
    loading,
    error,
    total,
    loadMore,
    refresh,
    search,
    filterByType,
    filterByCity,
    filterByRating,
  } = usePlaces(initialQuery);

  const renderPlace = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => onPlacePress?.(item)}
    >
      <Text style={styles.placeName}>{item.name}</Text>
      <Text style={styles.placeType}>{item.type}</Text>
      <Text style={styles.placeDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.placeLocation}>{item.location.city}</Text>
      <Text style={styles.placeRating}>⭐ {item.rating}/5</Text>
      <Text style={styles.placePrice}>💰 {item.priceRange} VND</Text>
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        renderItem={renderPlace}
        keyExtractor={(item) => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  placeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  placeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  placeLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  placeRating: {
    fontSize: 12,
    color: '#FFA500',
    marginBottom: 4,
  },
  placePrice: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default PlaceList;

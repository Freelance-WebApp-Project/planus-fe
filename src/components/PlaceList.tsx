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
  showImage?: boolean;
  cardStyle?: 'default' | 'compact';
}

const PlaceList: React.FC<PlaceListProps> = ({ 
  onPlacePress, 
  initialQuery = {}, 
  showImage = true,
  cardStyle = 'default'
}) => {
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
      style={cardStyle === 'compact' ? styles.placeCardCompact : styles.placeCard}
      onPress={() => onPlacePress?.(item)}
    >
      {showImage && (
        <View style={styles.placeImage}>
          <Text style={styles.placeImageText}>🏢</Text>
        </View>
      )}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name || 'N/A'}</Text>
        <Text style={styles.placeType}>
          {item.type ? item.type.replace('_', ' ').toUpperCase() : 'N/A'}
        </Text>
        <Text style={styles.placeDescription} numberOfLines={2}>
          {item.description || 'N/A'}
        </Text>
        <Text style={styles.placeLocation}>
          {item.location?.city || 'N/A'}
        </Text>
        <Text style={styles.placeRating}>
          ⭐ {item.rating || 0}/5
        </Text>
        <Text style={styles.placePrice}>
          💰 {item.priceRange ? item.priceRange.toLocaleString() : 0} VND
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>
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
    paddingHorizontal: 20,
  },
  placeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  placeCardCompact: {
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
  placeImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  placeImageText: {
    fontSize: 36,
    color: '#6C757D',
  },
  placeInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 6,
    lineHeight: 22,
  },
  placeType: {
    fontSize: 12,
    color: '#6C757D',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  placeDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
    lineHeight: 20,
  },
  placeLocation: {
    fontSize: 13,
    color: '#868E96',
    marginBottom: 8,
    fontWeight: '500',
  },
  placeRating: {
    fontSize: 13,
    color: '#FFC107',
    fontWeight: '600',
    marginBottom: 4,
  },
  placePrice: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '700',
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
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#5A9FD8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#5A9FD8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default PlaceList;

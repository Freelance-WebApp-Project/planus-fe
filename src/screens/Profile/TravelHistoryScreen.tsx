import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { planService } from '../../services/plan.service';
import { SavedPlan } from '../../types/plan.types';
import { API_CONFIG } from '../../constants/api.constants';

const TravelHistoryScreen = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPaidPlans = async () => {
    try {
      setLoading(true);
      const response = await planService.getMe({ isPaid: true });
      if (response.success && response.data) {
        setPlans(response.data.records);
      }
    } catch (error) {
      console.error('Error fetching paid plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPaidPlans();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPaidPlans();
  }, []);

  const renderPlanCard = ({ item }: { item: SavedPlan }) => {
    const firstPlace = item.itinerary[0]?.placeId;
    const imageUrl = firstPlace?.images?.[0]?.imageUrl
      ? `${API_CONFIG.UPLOADS_URL}/${firstPlace.images[0].imageUrl}`
      : `https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(item.planTitle)}`;

    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => {
          // Navigate to plan details
          (navigation as any).navigate('PlanDetails', { 
            plan: {
              planTitle: item.planTitle,
              totalDuration: item.totalDuration,
              estimatedCost: item.estimatedCost,
              itinerary: item.itinerary.map(it => ({
                _id: it.placeId._id,
                order: it.order,
                distance: it.distance,
                travelTime: it.travelTime,
                placeInfo: {
                  _id: it.placeId._id,
                  name: it.placeId.name,
                  type: it.placeId.type,
                  description: '',
                  location: {
                    address: it.placeId.location.address,
                    city: it.placeId.location.city,
                    coordinates: {
                      type: 'Point' as const,
                      coordinates: it.placeId.location.coordinates.coordinates,
                    },
                  },
                  priceRange: it.placeId.priceRange,
                  rating: it.placeId.rating,
                  tags: [],
                  images: it.placeId.images.map(img => img.imageUrl),
                },
              })),
            },
            planId: item._id
          });
        }}
      >
        <Image source={{ uri: imageUrl }} style={styles.planImage} />
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>{item.planTitle}</Text>
          <View style={styles.planDetails}>
            <Text style={styles.planDuration}>⏰ {item.totalDuration}</Text>
            <Text style={styles.planCost}>💰 {item.estimatedCost.toLocaleString()}đ</Text>
          </View>
          <Text style={styles.planPlacesCount}>
            📍 {item.itinerary.length} địa điểm
          </Text>
          <View style={styles.statusContainer}>
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>✓ Đã thanh toán</Text>
            </View>
            <Text style={styles.createdDate}>
              📅 {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử chuyến đi</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5A9FD8" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử chuyến đi</Text>
        <View style={styles.placeholder} />
      </View>
      
      {plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Chưa có chuyến đi nào</Text>
          <Text style={styles.emptyDescription}>
            Các kế hoạch đã thanh toán sẽ hiển thị ở đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#5A9FD8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  placeholder: {
    width: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  planInfo: {
    padding: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planDuration: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  planCost: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },
  planPlacesCount: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paidBadge: {
    backgroundColor: '#28A745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  createdDate: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
});

export default TravelHistoryScreen;

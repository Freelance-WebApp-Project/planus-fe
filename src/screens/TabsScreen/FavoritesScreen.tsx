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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { planService } from '../../services/plan.service';
import { SavedPlan } from '../../types/plan.types';
import { API_CONFIG } from '../../constants/api.constants';
import { FontAwesome } from "@expo/vector-icons";

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planService.getMe({ isFavorite: true });
      if (response.success && response.data) {
        setPlans(response.data.records);
        console.log('Plans:', response.data.records);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPlans();
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
            <Text style={styles.planCost}>
              <FontAwesome name="money" size={20} color="#green"/>{' '}
               {item.estimatedCost.toLocaleString()}</Text>
          </View>
          <Text style={styles.planPlacesCount}>
            📍 {item.itinerary.length} địa điểm
          </Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>👤 {item.userId.username}</Text>
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
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Kế hoạch yêu thích</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4facfe" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Kế hoạch yêu thích</Text>
      </LinearGradient>
      
      {plans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Chưa có kế hoạch yêu thích</Text>
          <Text style={styles.emptyDescription}>
            Thêm kế hoạch vào yêu thích để xem ở đây
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  createdDate: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
});

export default FavoritesScreen;
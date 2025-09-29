import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 cards per row with margins

interface SuggestedPlan {
  id: string;
  title: string;
  image: string;
  rating: number;
  placesCount: number;
  distance: string;
  duration: string;
  price: string;
  isSelected?: boolean;
}

const SuggestedPlansScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedPurpose, selectedDuration, radius } = route.params as any;

  const [selectedPlan, setSelectedPlan] = useState<string>('plan1');

  const suggestedPlans: SuggestedPlan[] = [
    {
      id: 'plan1',
      title: 'Cà phê & Thư giãn',
      image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 5,
      placesCount: 3,
      distance: '15km',
      duration: '35 phút',
      price: '150,000 VND',
      isSelected: true,
    },
    {
      id: 'plan2',
      title: 'Ẩm thực Hà Nội',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4,
      placesCount: 6,
      distance: '12km',
      duration: '45 phút',
      price: '200,000 VND',
    },
    {
      id: 'plan3',
      title: 'Thư viện & Học tập',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 5,
      placesCount: 5,
      distance: '8km',
      duration: '25 phút',
      price: '80,000 VND',
    },
    {
      id: 'plan4',
      title: 'Giải trí & Thể thao',
      image: 'https://images.unsplash.com/photo-1594736797933-d0c0a0b0b0b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4,
      placesCount: 3,
      distance: '10km',
      duration: '30 phút',
      price: '120,000 VND',
    },
    {
      id: 'plan5',
      title: 'Chụp ảnh & Kỷ niệm',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4,
      placesCount: 8,
      distance: '18km',
      duration: '50 phút',
      price: '180,000 VND',
    },
    {
      id: 'plan6',
      title: 'Karaoke & Ca hát',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      rating: 4,
      placesCount: 3,
      distance: '6km',
      duration: '20 phút',
      price: '100,000 VND',
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    // Navigate to plan details or next step
    console.log('Selected plan:', selectedPlan);
  };

  const renderPlanCard = ({ item }: { item: SuggestedPlan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        selectedPlan === item.id && styles.selectedPlanCard,
      ]}
      onPress={() => handlePlanSelect(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.planImage} />
      <View style={styles.planInfo}>
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Text
              key={index}
              style={[
                styles.star,
                index < item.rating ? styles.starFilled : styles.starEmpty,
              ]}
            >
              ★
            </Text>
          ))}
        </View>
        <View style={styles.locationContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{item.placesCount} địa điểm...</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Background Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
          }}
          style={styles.headerBackground}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />
        
        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Hà Nội, Việt Nam</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Travel Info Card */}
      <View style={styles.travelCard}>
        <View style={styles.travelInfo}>
          <View style={styles.travelFrom}>
            <Text style={styles.travelLabel}>Từ: Vị trí của tôi</Text>
            <View style={styles.travelDetails}>
              <Text style={styles.travelIcon}>📍</Text>
              <Text style={styles.travelText}>15km</Text>
            </View>
            <View style={styles.travelDetails}>
              <Text style={styles.travelIcon}>🏍️</Text>
              <Text style={styles.travelText}>Xe máy</Text>
            </View>
          </View>
          
          <View style={styles.travelTo}>
            <Text style={styles.travelLabel}>Đến: Hoà Lạc</Text>
            <View style={styles.travelDetails}>
              <Text style={styles.travelIcon}>⏰</Text>
              <Text style={styles.travelText}>35 phút</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Suggested Plans Section */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Kế hoạch gợi ý</Text>
        
        <FlatList
          data={suggestedPlans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plansGrid}
          columnWrapperStyle={styles.planRow}
        />
        
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>Thêm...</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Tiếp</Text>
          <Text style={styles.continueIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerContent: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#FFF',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
    color: '#FFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  travelCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  travelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  travelFrom: {
    flex: 1,
  },
  travelTo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  travelLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  travelDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  travelIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  travelText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  plansSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 20,
  },
  plansGrid: {
    paddingBottom: 20,
  },
  planRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planCard: {
    width: cardWidth,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: '#FF4444',
  },
  planImage: {
    width: '100%',
    height: cardWidth * 0.7,
    resizeMode: 'cover',
  },
  planInfo: {
    padding: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 2,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#E9ECEF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
    color: '#FF4444',
  },
  locationText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  moreButtonText: {
    fontSize: 16,
    color: '#5A9FD8',
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#5A9FD8',
    marginRight: 8,
  },
  backLabel: {
    fontSize: 14,
    color: '#5A9FD8',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#5A9FD8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#5A9FD8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  continueIcon: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SuggestedPlansScreen;

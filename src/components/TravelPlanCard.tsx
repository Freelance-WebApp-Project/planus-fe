import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TravelPlan, ItineraryItem } from '../types/plan.types';

interface TravelPlanCardProps {
  plan: TravelPlan;
  onPress?: (plan: TravelPlan) => void;
  onPlacePress?: (place: ItineraryItem) => void;
}

const TravelPlanCard: React.FC<TravelPlanCardProps> = ({
  plan,
  onPress,
  onPlacePress,
}) => {
  const formatCost = (cost: number) => {
    return cost.toLocaleString('vi-VN') + ' VND';
  };

  const getPlanTypeColor = (title: string) => {
    if (title.toLowerCase().includes('ngắn gọn') || title.toLowerCase().includes('tiết kiệm')) {
      return '#28A745'; // Green for budget
    } else if (title.toLowerCase().includes('trung bình') || title.toLowerCase().includes('cân bằng')) {
      return '#FFC107'; // Yellow for balanced
    } else if (title.toLowerCase().includes('đầy đủ') || title.toLowerCase().includes('nhiều')) {
      return '#007BFF'; // Blue for comprehensive
    }
    return '#6C757D'; // Default gray
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(plan)}
      activeOpacity={0.8}
    >
      {/* Plan Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{plan.planTitle}</Text>
          <View style={[styles.typeIndicator, { backgroundColor: getPlanTypeColor(plan.planTitle) }]} />
        </View>
        <Text style={styles.duration}>{plan.totalDuration}</Text>
      </View>

      {/* Plan Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCost(plan.estimatedCost)}</Text>
          <Text style={styles.statLabel}>Chi phí</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{plan.itinerary.length}</Text>
          <Text style={styles.statLabel}>Địa điểm</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(
              plan.itinerary.reduce((sum, item) => sum + (item.placeInfo.rating || 0), 0) / 
              plan.itinerary.length * 10
            ) / 10}
          </Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
      </View>

      {/* Itinerary */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.itineraryContainer}
        contentContainerStyle={styles.itineraryContent}
      >
        {plan.itinerary.map((item, index) => (
          <TouchableOpacity
            key={item._id}
            style={styles.itineraryItem}
            onPress={() => onPlacePress?.(item)}
          >
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>{item.order}</Text>
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName} numberOfLines={1}>
                {item.placeInfo.name}
              </Text>
              <Text style={styles.placeType} numberOfLines={1}>
                {item.placeInfo.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.placeRating}>
                ⭐ {item.placeInfo.rating}/5
              </Text>
              {item.distance && (
                <Text style={styles.distance}>
                  📍 {item.distance}
                </Text>
              )}
              {item.travelTime && (
                <Text style={styles.travelTime}>
                  🚗 {item.travelTime}
                </Text>
              )}
            </View>
            {index < plan.itinerary.length - 1 && (
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  duration: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#DEE2E6',
    marginHorizontal: 8,
  },
  itineraryContainer: {
    marginTop: 4,
  },
  itineraryContent: {
    paddingRight: 16,
  },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5A9FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  orderText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  placeType: {
    fontSize: 10,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 2,
  },
  placeRating: {
    fontSize: 10,
    color: '#FFC107',
    fontWeight: '600',
  },
  distance: {
    fontSize: 9,
    color: '#6C757D',
    marginTop: 2,
  },
  travelTime: {
    fontSize: 9,
    color: '#6C757D',
  },
  arrow: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
});

export default TravelPlanCard;

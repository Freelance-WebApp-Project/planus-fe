import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TravelPlan } from "../../types/plan.types";
import { API_CONFIG } from "../../constants/api.constants";

const { width } = Dimensions.get("window");

const PlanDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params as { plan: TravelPlan };

  const renderPlaceItem = (item: any, index: number) => {
    const place = item.placeInfo;
    const imageUrl = place.images?.[0] 
      ? `${API_CONFIG.UPLOADS_URL}/${place.images[0]}` 
      : `https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(place.name)}`;

    return (
      <View key={item._id} style={styles.placeItem}>
        <View style={styles.placeHeader}>
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{item.order}</Text>
          </View>
          <View style={styles.placeInfo}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeType}>{place.type}</Text>
          </View>
        </View>
        
        <Image source={{ uri: imageUrl }} style={styles.placeImage} />
        
        <View style={styles.placeDetails}>
          <Text style={styles.placeDescription}>{place.description}</Text>
          
          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{place.location.address}</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Đánh giá:</Text>
            {[...Array(5)].map((_, i) => (
              <Text
                key={i}
                style={[
                  styles.star,
                  i < Math.round(place.rating) ? styles.starFilled : styles.starEmpty,
                ]}
              >
                ★
              </Text>
            ))}
            <Text style={styles.ratingValue}>({place.rating})</Text>
          </View>
          
          {place.priceRange > 0 && (
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Giá:</Text>
              <Text style={styles.priceValue}>{place.priceRange.toLocaleString()}đ</Text>
            </View>
          )}
          
          {item.distance && (
            <View style={styles.travelInfo}>
              <Text style={styles.travelLabel}>Khoảng cách:</Text>
              <Text style={styles.travelValue}>{item.distance}</Text>
            </View>
          )}
          
          {item.travelTime && (
            <View style={styles.travelInfo}>
              <Text style={styles.travelLabel}>Thời gian di chuyển:</Text>
              <Text style={styles.travelValue}>{item.travelTime}</Text>
            </View>
          )}
          
          {place.tags && place.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {place.tags.map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết kế hoạch</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.planTitle}>{plan.planTitle}</Text>
          <View style={styles.summaryInfo}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>⏰</Text>
              <Text style={styles.summaryLabel}>Thời gian</Text>
              <Text style={styles.summaryValue}>{plan.totalDuration}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text style={styles.summaryLabel}>Chi phí</Text>
              <Text style={styles.summaryValue}>{plan.estimatedCost.toLocaleString()}đ</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📍</Text>
              <Text style={styles.summaryLabel}>Địa điểm</Text>
              <Text style={styles.summaryValue}>{plan.itinerary.length} nơi</Text>
            </View>
          </View>
        </View>

        {/* Places List */}
        <View style={styles.placesSection}>
          <Text style={styles.sectionTitle}>Lộ trình chi tiết</Text>
          {plan.itinerary.map((item, index) => renderPlaceItem(item, index))}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            // Handle plan selection
            console.log("Selected plan:", plan.planTitle);
            navigation.goBack();
          }}
        >
          <Text style={styles.selectButtonText}>Chọn kế hoạch này</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: "#5A9FD8",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6C757D",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  placesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 16,
  },
  placeItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#5A9FD8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  placeType: {
    fontSize: 14,
    color: "#6C757D",
    textTransform: "capitalize",
  },
  placeImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  placeDetails: {
    padding: 16,
  },
  placeDescription: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#6C757D",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginRight: 8,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
  starFilled: {
    color: "#FFD700",
  },
  starEmpty: {
    color: "#E9ECEF",
  },
  ratingValue: {
    fontSize: 14,
    color: "#6C757D",
    marginLeft: 4,
  },
  priceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginRight: 8,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#28A745",
  },
  travelInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  travelLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginRight: 8,
  },
  travelValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#6C757D",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  selectButton: {
    backgroundColor: "#5A9FD8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#5A9FD8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default PlanDetailsScreen;

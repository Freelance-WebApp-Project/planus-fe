import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_CONFIG } from "../../constants/api.constants";

const ReviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params as { plan: any };

  const handleReview = (placeId: string, imageUrl: string, address: string, title: string) => {
    (navigation as any).navigate("ReviewDetailScreen", {
      placeId,
      imageUrl,
      address,
      title
    });
  };

  const renderPlaceCard = ({ item }: { item: any }) => {
    const place = item.placeInfo;
    const imageUrl =
      place?.images && place.images.length > 0
        ? `${API_CONFIG.UPLOADS_URL}/${place.images[0]}`
        : `https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(
            place?.name || "Địa điểm"
          )}`;

    return (
      <TouchableOpacity
        style={styles.planCard}
        onPress={() => handleReview(place?._id, imageUrl, place?.location?.address, place?.name)}
      >
        <View style={styles.card}>
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
          <View style={styles.cardInfo}>
            <Text style={styles.placeName}>{place?.name}</Text>

            {/* ⭐ Rating */}
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= (place?.rating || 0) ? "star" : "star-o"}
                  size={18}
                  color="#FFD700"
                />
              ))}
            </View>

            {/* 🗺️ Địa chỉ */}
            <View style={styles.addressRow}>
              <FontAwesome name="map-marker" size={14} color="#6C757D" />
              <Text style={styles.addressText}>
                {place?.location?.address || "Không có địa chỉ"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
          <FontAwesome name="arrow-left" size={18} color="#4facfe" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá các địa điểm</Text>
        <View style={styles.placeholder} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            (navigation as any).navigate("MainTabs", { screen: "Home" })
          }
        >
          <FontAwesome name="home" size={20} color="#4facfe" />
        </TouchableOpacity>
      </View>

      {plan.itinerary.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome
            name="map"
            size={64}
            color="#4facfe"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Không có địa điểm nào</Text>
        </View>
      ) : (
        <FlatList
          data={plan.itinerary}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderPlaceCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ReviewScreen;

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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  placeholder: {
    width: 36,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  cardInfo: {
    padding: 16,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#6C757D",
    flexShrink: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6C757D",
  },
  planCard: {
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
});

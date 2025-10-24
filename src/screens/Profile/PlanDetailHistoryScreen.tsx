import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TravelPlan, CreatePlanDto } from "../../types/plan.types";
import { API_CONFIG } from "../../constants/api.constants";
import { planService } from "../../services/plan.service";

const { width } = Dimensions.get("window");

const PlanDetailHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan, planId } = route.params as {
    plan: TravelPlan;
    planId?: string;
  };

  const [visitedPlaces, setVisitedPlaces] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];

  const toggleVisited = (index: number) => {
    setVisitedPlaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }

      if (newSet.size === plan.itinerary.length) {
        openModal();
      }

      return newSet;
    });
  };

  const handleTracking = () => {
    (navigation as any).navigate("CurrentRouteTrackingScreen", {
      plan,
      visitedPlaces: Array.from(visitedPlaces),
    });
  };

  const handleReview = () => {
    setShowModal(false);
    (navigation as any).navigate("ReviewScreen", {
      plan,
    });
  };

  const handleFullCheckBox = () => {
    // Khi bấm "Kết thúc lộ trình" → tích hết tất cả checkbox
    const allIndexes = new Set(plan.itinerary.map((_, i) => i));
    setVisitedPlaces(allIndexes);
    openModal();
  };

  const openModal = () => {
    setShowModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const DashedLine = ({ segments = 4, color = "#000", height = 60 }) => {
    return (
      <View style={{ height, justifyContent: "space-between" }}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 2,
              height: height / (segments * 2),
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    );
  };

  const renderPlaceItem = (item: any, index: number) => {
    const place = item.placeInfo;
    const imageUrl = place.images?.[0]
      ? `${API_CONFIG.UPLOADS_URL}/${place.images[0]}`
      : `https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(
          place.name
        )}`;

    return (
      <View key={item._id}>
        <View style={styles.placeContainer}>
          <View key={item._id} style={styles.itineraryItem}>
            <Image source={{ uri: imageUrl }} style={styles.placeImage} />
            {index !== plan.itinerary.length - 1 && (
              <View style={styles.verticalContainer}>
                <DashedLine height={50} />

                <View style={styles.orderBadgeMoto}>
                  <FontAwesome
                    name="motorcycle"
                    size={18}
                    color="#FFF"
                    style={styles.heartIcon}
                  />
                </View>
                <DashedLine height={50} />
              </View>
            )}
          </View>

          <View style={styles.information}>
            <View style={styles.placeContainer}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderText}>{item.order}</Text>
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.name}</Text>
                {/* <Text style={styles.placeType}>{place.type}</Text> */}
              </View>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => toggleVisited(index)}
              >
                <View
                  style={[
                    styles.checkbox,
                    visitedPlaces.has(index) && styles.checkboxChecked,
                  ]}
                >
                  {visitedPlaces.has(index) && (
                    <FontAwesome name="check" size={12} color="#FFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  {visitedPlaces.has(index) ? "Đã đến" : "Chưa đến"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.placeContainer}>
              <View style={styles.circle}>
                <View style={styles.starsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.star,
                        i < Math.round(place.rating)
                          ? styles.starFilled
                          : styles.starEmpty,
                      ]}
                    >
                      ★
                    </Text>
                  ))}
                </View>
              </View>

              {/* Hình chữ nhật bo tròn gắn vào hình tròn */}
              <View style={styles.rectangle}>
                <View style={styles.locationInfo}>
                  <FontAwesome
                    name="map-marker"
                    size={10}
                    color="#6C757D"
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationText}>
                    {place.location.address}
                  </Text>
                </View>
                <Text style={styles.priceText}>
                  {place.priceRange.toLocaleString()}VND/Người
                </Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {
                place.tags && place.tags.length > 0
                  ? place.tags.map((tag: string, tagIndex: number) => (
                      <View key={tagIndex} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))
                  : null // không hiển thị gì bên trong nhưng container vẫn tồn tại
              }
            </View>

            <View style={styles.placeDetails}>
              {index < plan.itinerary.length - 1 &&
                plan.itinerary[index + 1].distance && (
                  <View style={styles.travelInfo}>
                    <FontAwesome
                      name="map-marker"
                      size={18}
                      color="#FF6B6B"
                      style={styles.summaryIconLabel}
                    />
                    <Text style={styles.travelLabel}>Khoảng cách:</Text>
                    <Text style={styles.travelValue}>
                      {plan.itinerary[index + 1].distance}
                    </Text>
                  </View>
                )}

              {index < plan.itinerary.length - 1 &&
                plan.itinerary[index + 1].travelTime && (
                  <View style={styles.travelTimeInfo}>
                    <FontAwesome
                      name="clock-o"
                      size={18}
                      color="#4facfe"
                      style={styles.summaryIconLabel}
                    />
                    <Text style={styles.travelLabel}>Thời gian di chuyển:</Text>
                    <Text style={styles.travelValue}>
                      {plan.itinerary[index + 1].travelTime}
                    </Text>
                  </View>
                )}
            </View>
          </View>
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
          <FontAwesome name="arrow-left" size={18} color="#4facfe" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết kế hoạch</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.planTitle}>{plan.planTitle}</Text>
          <View style={styles.summaryInfo}>
            <View style={styles.summaryItem}>
              <FontAwesome
                name="clock-o"
                size={24}
                color="#4facfe"
                style={styles.summaryIcon}
              />
              <Text style={styles.summaryLabel}>Thời gian</Text>
              <Text style={styles.summaryValue}>{plan.totalDuration}</Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome
                name="money"
                size={24}
                color="#28A745"
                style={styles.summaryIcon}
              />
              <Text style={styles.summaryLabel}>Chi phí</Text>
              <Text style={styles.summaryValue}>
                {plan.estimatedCost.toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome
                name="map-marker"
                size={24}
                color="#FF6B6B"
                style={styles.summaryIcon}
              />
              <Text style={styles.summaryLabel}>Địa điểm</Text>
              <Text style={styles.summaryValue}>
                {plan.itinerary.length} nơi
              </Text>
            </View>
          </View>
        </View>

        {/* Places List */}
        <View style={styles.placesSection}>
          <Text style={styles.sectionTitle}>Lộ trình chi tiết</Text>
          {plan.itinerary.map((item, index) => renderPlaceItem(item, index))}
        </View>

        <Modal transparent visible={showModal} animationType="none">
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.title}>🎉 Bạn đã đến đích!</Text>
              <View style={styles.headerLogo}>
                <Image
                  source={require("../../../assets/banner.png")}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                  }}
                />
              </View>
              <Text style={styles.subText}>
                Xin vui lòng đánh giá dịch vụ của chúng tôi!
              </Text>

              <View style={styles.placeModal}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReview}
                  style={styles.reviewButton}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Đánh giá
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.selectButton]}
          onPress={handleTracking}
        >
          <Text style={styles.selectButtonText}>Theo dõi lộ trình</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectReviewButton]}
          onPress={handleFullCheckBox}
        >
          <Text style={styles.selectButtonText}>Kết thúc lộ trình</Text>
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
  headerLogo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    // borderBottomWidth: 1,
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
    backgroundColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 3,
  },
  orderBadgeMoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 1,
  },
  orderText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  placeInfo: {
    flex: 1,
    minWidth: 120,
  },
  placeName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212529",
  },
  placeType: {
    fontSize: 14,
    color: "#6C757D",
    textTransform: "capitalize",
  },
  placeImage: {
    width: "60%",
    height: 100,
    borderRadius: 30,
    resizeMode: "cover",
  },
  placeContainer: {
    flexDirection: "row",
    // marginRight: 5,
  },
  information: {
    marginLeft: -20,
  },
  placeModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 5,
  },
  placeDetails: {
    paddingTop: -20,
    marginBottom: 2,
    marginLeft: 8,
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
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 10,
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
    fontSize: 10,
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
    marginBottom: 4,
  },
  travelTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIconLabel: {
    marginBottom: 5,
  },
  travelLabel: {
    fontSize: 14,
    color: "#6C757D",
    marginRight: 2,
    marginLeft: 8,
    marginBottom: 4,
  },
  travelValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    minHeight: 30,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectButton: {
    backgroundColor: "#4facfe",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: 20,
  },
  selectReviewButton: {
    backgroundColor: "#FFCC33",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: 20,
  },
  selectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "#6ec3ee",
    backgroundColor: "#FFF", // Màu vàng cho circle
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  starsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  rectangle: {
    backgroundColor: "#4FC3F7", // Màu xanh dương
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 7,
    marginLeft: -10, // Gắn vào circle bằng cách overlap
    minWidth: 193,
    height: 50,
    flex: 1,
    alignItems: "center",
  },
  priceText: {
    marginTop: -8,
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  itineraryContainer: {
    flexDirection: "column", // xếp ảnh dọc
    alignItems: "center",
    paddingVertical: 10,
  },
  itineraryItem: {
    alignItems: "center",
    width: "48%",
    marginLeft: -40,
  },
  verticalLine: {
    width: 4, // độ dày của gạch dọc
    height: 40, // chiều dài nối giữa các ảnh
    backgroundColor: "#000",
    marginVertical: 4, // khoảng cách trên/dưới ảnh
    borderStyle: "dashed",
  },
  verticalContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  heartIcon: {
    textAlign: "center",
  },
  diagonalLine: {
    position: "absolute",
    width: 65, // chiều dài đường
    height: 2, // độ dày
    backgroundColor: "#000",
    transformOrigin: "top left", // đầu đường là điểm xoay
    zIndex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#4facfe",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#4facfe",
    borderColor: "#4facfe",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#6C757D",
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "green",
    marginBottom: 10,
  },
  subText: {
    fontSize: 15,
    color: "#555",
    marginTop: 10,
    textAlign: "center",
  },
  stars: {
    flexDirection: "row",
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  reviewButton: {
    backgroundColor: "#FFCC33",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
});

export default PlanDetailHistoryScreen;

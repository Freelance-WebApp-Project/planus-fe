import React, { useEffect, useState } from "react";
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
  Animated,
  Easing,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TravelPlan, CreatePlanDto } from "../../types/plan.types";
import { API_CONFIG } from "../../constants/api.constants";
import { planService } from "../../services/plan.service";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "../../utils/toast.utils";
import { User } from "../../types/auth.types";
import { useAuth } from "../../hoc/AuthContext";
import { userService } from "../../services/user.service";

const { width } = Dimensions.get("window");

const PlanDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan, planId } = route.params as {
    plan: any; // Sử dụng any để tương thích với dữ liệu API mới
    planId?: string;
  };
  const { user, logout, isLoading, setUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingFavorite, setProcessingFavorite] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPaidNumber, setIsPaidNumber] = useState(0);
  const [isPaidPoint, setIsPaidPoint] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("wallet");
  const slideAnim = useState(new Animated.Value(300))[0];

  useEffect(() => {
    if (plan.planTitle === "Kế hoạch tiết kiệm") {
      setIsPaidNumber(5000);
      setIsPaidPoint(5);
    } else if (plan.planTitle === "Kế hoạch trung bình") {
      setIsPaidNumber(10000);
      setIsPaidPoint(10);
    } else if (plan.planTitle === "Kế hoạch đầy đủ") {
      setIsPaidNumber(15000);
      setIsPaidPoint(15);
    }
  }, [plan.planTitle]);

  const fetchCurrentUser = async () => {
    try {
      const response = await userService.getMe();
      if (response.success && response.data) {
        setCurrentUser(response.data);
        // Also update the context user
        setUser(response.data);
      } else {
        showToast.error("Lỗi", "Không thể tải thông tin người dùng");
      }
    } catch (error) {
      showToast.error("Lỗi", "Có lỗi xảy ra khi tải thông tin");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const isPremiumUser = currentUser?.isPremium || false;
  console.log("isPremiumUser", isPremiumUser);

  const handleSelectPaymentMethod = () => {
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

  const handleCreateWithPayment = (selectedMethod: string, amount: number) => {
    const paymentText =
      selectedMethod === "wallet"
        ? `Thanh toán bằng ví: ${amount.toLocaleString()} VND`
        : `Thanh toán bằng điểm: ${amount.toLocaleString()} điểm`;

    Alert.alert(
      "Xác nhận thanh toán",
      `${paymentText} cho kế hoạch "${plan.planTitle}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: () => processPayment(selectedMethod, amount),
        },
      ],
      { cancelable: true }
    );
  };

  const processPayment = async (selectedMethod: string, amount: number) => {
    try {
      setProcessingPayment(true);
      console.log("Init Data:", selectedMethod, amount);

      const createPlanData: CreatePlanDto = {
        planTitle: plan.planTitle,
        totalDuration: plan.totalDuration,
        estimatedCost: selectedMethod === "wallet" ? amount : 0,
        point: selectedMethod === "point" ? amount : 0,
        pointBonus: selectedMethod === "wallet" ? isPaidPoint : 0,
        itinerary: plan.itinerary.map((item: any) => ({
          placeId: item.place?._id || item.placeInfo?._id,
          order: item.order,
          distance: item.distance?.toString() || "0",
          travelTime: item.travelTime || "0 phút",
        })),
        isPaid: true,
        isUsingPoint: selectedMethod === "point" ? true : false,
      };

      console.log("createPlanData:", createPlanData);

      const response = await planService.createWithPayment(createPlanData);

      if (response.success) {
        console.log("Plan created with payment successfully", response.data);
        showToast.success(
          "Thanh toán thành công!",
          "Kế hoạch đã được tạo và thanh toán thành công."
        );

        const createdPlanId = response?.data?.data?._id;

        await fetchAndNavigateToPaidPlan(createdPlanId);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error creating plan with payment:", error);
      showToast.error(
        "Lỗi thanh toán",
        "Không thể tạo kế hoạch. Vui lòng thử lại."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const fetchAndNavigateToPaidPlan = async (planId?: string) => {
    try {
      // Lấy danh sách plan đã thanh toán
      const res = await planService.getMe({ isPaid: true });
      const plans = res?.data?.records || [];

      // Tìm plan vừa tạo
      const newPlan = plans.find((p: any) => p._id === planId) || plans[0];

      if (!newPlan) {
        console.warn("⚠️ No paid plan found!");
        return;
      }

      // Điều hướng sang màn chi tiết
      (navigation as any).navigate("PlanDetailHistoryScreen", {
        plan: {
          planTitle: newPlan.planTitle,
          totalDuration: newPlan.totalDuration,
          estimatedCost: newPlan.estimatedCost,
          itinerary: newPlan.itinerary.map((it) => ({
            _id: it.placeId._id,
            order: it.order,
            distance: it.distance,
            travelTime: it.travelTime,
            placeInfo: {
              _id: it.placeId._id,
              name: it.placeId.name,
              type: it.placeId.type,
              description: "",
              location: {
                address: it.placeId.location.address,
                city: it.placeId.location.city,
                coordinates: {
                  type: "Point" as const,
                  coordinates: it.placeId.location.coordinates.coordinates,
                },
              },
              priceRange: it.placeId.priceRange,
              rating: it.placeId.rating,
              tags: [],
              images: it.placeId.images.map((img) => img.imageUrl),
            },
          })),
        },
        planId: newPlan._id,
      });
    } catch (error) {
      console.error("❌ Error fetching paid plans:", error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      setProcessingFavorite(true);

      if (isFavorited) {
        // If already favorited, unfavorite using plan ID
        if (planId) {
          const response = await planService.unfavorite(planId);

          if (response.success) {
            setIsFavorited(false);
            console.log("Plan unfavorited successfully");
          }
        } else {
          console.error("Plan ID not found for unfavorite operation");
        }
      } else {
        // If not favorited, add to favorites
        const favoritePlanData: CreatePlanDto = {
          planTitle: plan.planTitle,
          totalDuration: plan.totalDuration,
          estimatedCost: selectedMethod === "wallet" ? isPaidNumber : 0,
          point: selectedMethod === "point" ? isPaidPoint : 0,
          pointBonus: selectedMethod === "wallet" ? isPaidPoint : 0,
          itinerary: plan.itinerary.map((item: any) => ({
            placeId: item.place?._id || item.placeInfo?._id,
            order: item.order,
            distance: item.distance?.toString() || "0",
            travelTime: item.travelTime || "0 phút",
          })),
          isPaid: false,
          isShared: false,
          isFavorite: true,
          isUsingPoint: selectedMethod === "point" ? true : false,
        };

        const response = await planService.toggleFavorite(favoritePlanData);

        if (response.success) {
          setIsFavorited(true);
          console.log("Plan favorited successfully");
          showToast.success(
            "Đã thêm vào yêu thích",
            "Kế hoạch đã được lưu vào danh sách yêu thích"
          );
        }
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      showToast.error("Lỗi", "Không thể cập nhật trạng thái yêu thích");
    } finally {
      setProcessingFavorite(false);
    }
  };

  const renderPlaceItem = (item: any, index: number) => {
    const place = item.place || item.placeInfo;
    const imageUrl = place?.images?.[0]
      ? `${API_CONFIG.UPLOADS_URL}/${place.images[0]}`
      : `https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(
          place?.name || "Địa điểm"
        )}`;

    return (
      <View key={index} style={styles.itineraryItemContainer}>
        {/* Place Card */}
        <View style={styles.placeCard}>
          {/* Order Badge on Image */}
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{item.order}</Text>
          </View>
          <Image source={{ uri: imageUrl }} style={styles.placeImage} />

          {/* Overlay Info */}
          <View style={styles.infoOverlay}>
            {/* Stars */}
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Text
                  key={i}
                  style={[
                    styles.star,
                    i < Math.round(place?.rating || 0)
                      ? styles.starFilled
                      : styles.starEmpty,
                  ]}
                >
                  ★
                </Text>
              ))}
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {place?.tags && place.tags.length > 0
                ? place.tags
                    .slice(0, 3)
                    .map((tag: string, tagIndex: number) => (
                      <View key={tagIndex} style={styles.tag}>
                        <Text style={styles.tagText} numberOfLines={1}>
                          {tag}
                        </Text>
                      </View>
                    ))
                : null}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết kế hoạch</Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleToggleFavorite}
          disabled={processingFavorite}
        >
          {processingFavorite ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <FontAwesome
              name={isFavorited ? "heart" : "heart-o"}
              size={20}
              color="#FFF"
            />
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.planTitle}>{plan.planTitle}</Text>
          <View style={styles.summaryInfo}>
            <View style={styles.summaryItem}>
              <FontAwesome name="clock-o" size={24} color="#4facfe" />
              <Text style={styles.summaryLabel}>Thời gian</Text>
              <Text style={styles.summaryValue}>{plan.totalDuration}</Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome name="money" size={24} color="#28A745" />
              <Text style={styles.summaryLabel}>Chi phí dự kiến</Text>
              <Text style={styles.summaryValue}>
                {(plan.totalCost || plan.estimatedCost || 0).toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome name="money" size={24} color="#28A745" />
              <Text style={styles.summaryLabel}>Thanh toán</Text>
              <Text style={styles.summaryValue}>
                {isPaidNumber.toLocaleString()}đ
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome name="map-marker" size={24} color="#FF6B6B" />
              <Text style={styles.summaryLabel}>Địa điểm</Text>
              <Text style={styles.summaryValue}>
                {plan.itinerary.length} nơi
              </Text>
            </View>
          </View>
        </View>

        {/* Places List */}
        <View style={styles.placesSection}>
          <Text style={styles.sectionTitle}>Lộ trình xem trước</Text>
          <View style={styles.itineraryWrapper}>
            {plan.itinerary.map((item: any, index: number) =>
              renderPlaceItem(item, index)
            )}
          </View>
        </View>

        <Modal transparent visible={showModal} animationType="none">
          <View style={styles.overlay}>
            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.title}>Chọn phương thức thanh toán</Text>
              <View style={styles.containerModal}>
                {/* Thanh toán khi nhận hàng */}
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedMethod === "wallet" && styles.selectedOptionWallet,
                  ]}
                  onPress={() => setSelectedMethod("wallet")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedMethod === "wallet" && styles.selectedTextWallet,
                    ]}
                  >
                    Thanh toán bằng ví: {isPaidNumber.toLocaleString()} VND
                  </Text>
                </TouchableOpacity>

                {/* Chuyển khoản ngân hàng */}
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedMethod === "point" && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedMethod("point")}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedMethod === "point" && styles.selectedText,
                    ]}
                  >
                    Thanh toán bằng điểm: {isPaidPoint.toLocaleString()} điểm
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.placeModal}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleCreateWithPayment(
                      selectedMethod,
                      selectedMethod === "wallet" ? isPaidNumber : isPaidPoint
                    )
                  }
                  style={styles.reviewButton}
                >
                  <Text style={styles.buttonText}>Thanh toán</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.selectButton,
            processingPayment && styles.disabledButton,
          ]}
          onPress={() => {
            if (isPremiumUser) {
              fetchAndNavigateToPaidPlan(); // Gọi hàm cho Premium
            } else {
              handleSelectPaymentMethod(); // Gọi hàm bình thường
            }
          }}
          disabled={processingPayment}
        >
          <LinearGradient
            colors={
              processingPayment ? ["#ccc", "#999"] : ["#4facfe", "#00f2fe"]
            }
            style={styles.gradientButton}
          >
            {processingPayment ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.selectButtonText}>
                Thanh toán và tạo kế hoạch
              </Text>
            )}
          </LinearGradient>
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
    color: "#FFF",
  },
  placeholder: {
    width: 36,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 20,
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
  itineraryWrapper: {
    alignItems: "center",
  },
  itineraryItemContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  connectorContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  verticalLine: {
    width: 3,
    height: 30,
    backgroundColor: "#4facfe",
    borderRadius: 2,
  },
  verticalLineBottom: {
    width: 3,
    height: 20,
    backgroundColor: "#4facfe",
    borderRadius: 2,
  },
  routeIconContainer: {
    position: "relative",
    marginVertical: 5,
  },
  routeIcon: {
    fontSize: 20,
    textAlign: "center",
  },
  diagonalLineLeft: {
    position: "absolute",
    top: 5,
    left: -15,
    width: 15,
    height: 2,
    backgroundColor: "#4facfe",
    transform: [{ rotate: "-45deg" }],
  },
  diagonalLineRight: {
    position: "absolute",
    top: 5,
    right: -15,
    width: 15,
    height: 2,
    backgroundColor: "#4facfe",
    transform: [{ rotate: "45deg" }],
  },
  placeCard: {
    width: width * 0.85,
    backgroundColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
    position: "relative",
  },
  orderBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  orderText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  placeImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  star: {
    fontSize: 16,
    color: "#FFD700",
    marginHorizontal: 1,
  },
  starEmpty: {
    color: "rgba(255,255,255,0.5)",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "500",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  selectButton: {
    borderRadius: 12,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 30,
    minHeight: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 20,
    textAlign: "center",
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
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  reviewButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  placeModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 0,
  },
  option: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOption: {
    borderColor: "#007bff",
    borderWidth: 2,
    backgroundColor: "#f8f9ff",
  },
  selectedOptionWallet: {
    borderColor: "#007bff",
    borderWidth: 2,
    backgroundColor: "#f8f9ff",
  },
  optionText: {
    color: "#495057",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "left",
  },
  selectedText: {
    color: "#007bff",
    fontWeight: "600",
    fontSize: 16,
  },
  selectedTextWallet: {
    color: "#007bff",
    fontWeight: "600",
    fontSize: 16,
  },
  checkIcon: {
    position: "absolute",
    bottom: 4,
    right: 4,
  },
  containerModal: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    alignItems: "stretch",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  starFilled: {
    color: "#FFD700",
  },
});

export default PlanDetailsScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import {
  GeneratePlanRequest,
  GeneratePlanResponse,
  PlaceInfo,
  TravelPlan,
} from "../../types/plan.types";
import { planService } from "../../services/plan.service";
import { API_CONFIG } from "../../constants/api.constants";
import { showToast } from "../../utils/toast.utils";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 3; // 3 cards per row with margins

const purposes = [
  { id: "dating", label: "Hẹn hò", icon: "💕" },
  { id: "relax", label: "Thư giãn", icon: "🧘" },
  { id: "coffee", label: "Cà phê", icon: "☕" },
  { id: "explore", label: "Khám phá", icon: "🗺️" },
  { id: "food", label: "Ẩm thực", icon: "🍜" },
];

const durations = [
  { id: "half-day", label: "Nửa ngày", icon: "🌅" },
  { id: "full-day", label: "Cả ngày", icon: "🌞" },
  { id: "multi-day", label: "Nhiều ngày", icon: "📅" },
];

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

interface ApiTravelPlan {
  planTitle: string;
  totalDuration: string;
  totalCost: number;
  totalDistance: number;
  itinerary: {
    distance: number;
    order: number;
    place: {
      _id: string;
      images: string[];
      location: any;
      name: string;
      priceRange: number;
      rating: number;
      tags: string[];
      type: string;
    };
    travelTime: string;
  }[];
}

const weatherLabelToIcon = (label: string) => {
  switch (label) {
    case "Quang":
      return "☀️";
    case "Chủ yếu quang":
      return "🌤️";
    case "Một phần mây":
      return "⛅";
    case "Âm u":
      return "☁️";
    case "Mưa nhẹ":
      return "🌦️";
    case "Mưa vừa":
      return "🌧️";
    case "Mưa to":
      return "🌧️🌧️";
    case "Mưa rào nhẹ":
      return "🌦️";
    case "Mưa rào vừa":
      return "🌧️";
    case "Mưa rào to":
      return "🌧️🌧️";
    case "Dông":
      return "⛈️";
    case "Dông + mưa đá nhẹ":
      return "🌩️";
    case "Dông + mưa đá to":
      return "🌩️❄️";
    default:
      return "❓";
  }
};

const SuggestedPlansScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    start,
    end,
    selectedPurpose,
    selectedDuration,
    radius,
    weatherStart,
    weatherEnd,
    travelDate,
  } = route.params as {
    start: { lat: number; lng: number; address: string };
    end: { lat: number; lng: number; address: string };
    selectedPurpose: string;
    selectedDuration: string;
    radius: number;
    weatherStart: {
      temperatureMax: number;
      temperatureMin: number;
      precipitation: number;
      precipitationProbability: number;
      weatherLabel: string;
    };
    weatherEnd: {
      temperatureMax: number;
      temperatureMin: number;
      precipitation: number;
      precipitationProbability: number;
      weatherLabel: string;
    };
    travelDate: string;
  };

  const travelDateObj = travelDate ? new Date(travelDate) : new Date();

  // Lấy label từ id
  const selectedPurposeLabel =
    purposes.find((p) => p.id === selectedPurpose)?.label ?? "";
  const selectedDurationLabel =
    durations.find((d) => d.id === selectedDuration)?.label ?? "";

  const [selectedPlan, setSelectedPlan] = useState<string>("plan1");

  const [routeCoords, setRouteCoords] = useState<any[]>([]);

  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<{ h: number; m: number } | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [suggestedPlans, setSuggestedPlans] = useState<ApiTravelPlan[]>([]);

  const handlePlanSelect = (plan: ApiTravelPlan) => {
    setSelectedPlan(plan.planTitle);
    // Navigate to plan details
    (navigation as any).navigate("PlanDetails", { plan });
  };

  const renderPlanCard = ({ item }: { item: ApiTravelPlan }) => {
    const firstPlace = item.itinerary[0]?.place;
    const imageUrl = firstPlace?.images?.[0]
      ? `${API_CONFIG.UPLOADS_URL}/${firstPlace.images[0]}`
      : `https://via.placeholder.com/200x150/87CEEB/FFFFFF?text=${encodeURIComponent(
          item.planTitle
        )}`;

    return (
      <TouchableOpacity
        style={[
          styles.planCard,
          selectedPlan === item.planTitle && styles.selectedPlanCard,
        ]}
        onPress={() => handlePlanSelect(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.planImage} />
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>{item.planTitle}</Text>
          <View style={styles.planDetails}>
            <Text style={styles.planDuration}>⏰ {item.totalDuration}</Text>
            <Text style={styles.planCost}>
              Chi phí dự kiến: {(item.totalCost || 0).toLocaleString()}đ
            </Text>
          </View>
          <View style={styles.planDetails}>
            <Text style={styles.planPlacesCount}>
              📍 {item.itinerary.length} địa điểm
            </Text>
            <Text style={styles.planCost}>
              Thanh toán:{" "}
              {(item.planTitle === "Kế hoạch tiết kiệm"
                ? 5000
                : item.planTitle === "Kế hoạch tốt nghiệp"
                ? 10000
                : item.planTitle === "Kế hoạch trung bình"
                ? 15000
                : item.planTitle === "Kế hoạch đầy đủ"
                ? 20000
                : 0
              ).toLocaleString()} đ
            </Text>
          </View>
          <Text style={styles.planDistance}>
            🗺️ {(item.totalDistance || 0).toFixed(1)} km
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getRoute = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    try {
      const url = `${API_CONFIG.OSRM_URL}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          (c: number[]) => ({
            latitude: c[1],
            longitude: c[0],
          })
        );
        setRouteCoords(coords);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const toRad = (value: number) => (value * Math.PI) / 180;

  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // bán kính trái đất (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  };

  const estimateTravelTime = (distanceKm: number, speedKmH: number) => {
    const totalMinutes = Math.round((distanceKm / speedKmH) * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return { h, m };
  };

  useEffect(() => {
    if (start && end) {
      const dist = haversineDistance(start.lat, start.lng, end.lat, end.lng);
      setDistance(dist);

      // xe máy 40 km/h
      const { h, m } = estimateTravelTime(dist, 40);
      setTravelTime({ h, m });
    }
  }, [start, end]);

  useEffect(() => {
    if (start && end) {
      getRoute(start, end);
    }
  }, [start, end]);

  const generatePlan = async () => {
    if (!selectedPurpose || !selectedDuration || !radius || !start || !end) {
      showToast.error("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const request: GeneratePlanRequest = {
      lat: end.lat,
      lng: end.lng,
      city: end.address,
      purpose: selectedPurpose,
      duration: selectedDuration,
      radius: radius,
      destination: end.address,
    };

    try {
      setLoading(true);
      const response = await planService.generatePlan(request);
      console.log(response?.data?.plans[0].itinerary);
      if (response && response.success && response.data) {
        setSuggestedPlans(response.data.plans as unknown as ApiTravelPlan[]);
        showToast.success("Thành công", "Tạo kế hoạch thành công!");
      } else {
        setLoading(false);
        showToast.error("Có lỗi xảy ra", "Hệ thống gặp sự cố khi tạo kế hoạch");
      }
    } catch (error) {
      console.error("Error calling generatePlan:", error);
      setLoading(false);
      showToast.error("Lỗi kết nối", "Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, [selectedPurpose, selectedDuration, radius, start, end]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kế hoạch gợi ý</Text>
      </View>

      {/* Header with Background Image */}
      <View style={styles.headerContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 21.0285, // Hà Nội
            longitude: 105.8542,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Marker vị trí hiện tại */}
          <Marker
            coordinate={{
              latitude: start.lat,
              longitude: start.lng,
            }}
            title="Bạn đang ở đây"
            pinColor="red"
          />

          {/* Marker điểm đến */}
          <Marker
            coordinate={{
              latitude: end.lat,
              longitude: end.lng,
            }}
            title="Điểm đến"
            pinColor="blue"
          />

          {/* Vẽ đường đi */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}
        </MapView>
      </View>

      {/* Travel Info Card */}
      <View style={styles.travelCard}>
        <View style={styles.dateRow}>
          <FontAwesome
            name="calendar"
            size={16}
            color="#4facfe"
            style={styles.dateIcon}
          />
          <Text style={styles.travelLabel}>Ngày: {travelDate}</Text>
        </View>
        <View style={styles.travelInfo}>
          <View style={styles.travelHalf}>
            <Text
              style={styles.titleLabel}
              numberOfLines={0}
              allowFontScaling={false}
            >
              Từ: {start.address}
            </Text>
            <View style={styles.travelDetails}>
              <View style={styles.weatherCard}>
                <View style={styles.weatherTopRow}>
                  <Text style={styles.weatherIcon}>
                    {weatherLabelToIcon(weatherStart.weatherLabel)}
                  </Text>
                  <Text style={styles.tempText}>
                    {weatherStart.temperatureMax}° /{" "}
                    {weatherStart.temperatureMin}°
                  </Text>
                </View>
                <Text style={styles.weatherLabel}>
                  {weatherStart.weatherLabel} (
                  {weatherStart.precipitationProbability}%)
                </Text>
              </View>
            </View>
            <View style={styles.travelDetails2}>
              <Text style={styles.travelIcon}>⏰</Text>
              {distance !== null && travelTime && (
                <Text style={styles.travelText}>
                  {travelTime.h > 0 ? `${travelTime.h} giờ ` : ""}
                  {travelTime.m} phút
                </Text>
              )}
            </View>
          </View>
          <View style={styles.travelHalf}>
            <Text
              style={styles.titleLabel}
              numberOfLines={0}
              allowFontScaling={false}
            >
              Đến: {end.address}
            </Text>
            <View style={styles.travelDetails}>
              <View style={styles.weatherCard}>
                <View style={styles.weatherTopRow}>
                  <Text style={styles.weatherIcon}>
                    {weatherLabelToIcon(weatherEnd.weatherLabel)}
                  </Text>
                  <Text style={styles.tempText}>
                    {weatherEnd.temperatureMax}° / {weatherEnd.temperatureMin}°
                  </Text>
                </View>
                <Text style={styles.weatherLabel}>
                  {weatherEnd.weatherLabel} (
                  {weatherEnd.precipitationProbability}%)
                </Text>
              </View>
            </View>
            <View style={styles.travelDetails2}>
              <Text style={styles.travelIcon}>📍</Text>
              <Text style={styles.travelText}>
                {distance ? `${distance.toFixed(2)} km` : "Đang tính..."}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.travelTo}>
          <View style={styles.infoRow}>
            <FontAwesome
              name="bullseye"
              size={14}
              color="#FF6B6B"
              style={styles.infoIcon}
            />
            <Text style={styles.titleLabel2}>
              Mục đích: {selectedPurposeLabel}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome
              name="clock-o"
              size={14}
              color="#4ECDC4"
              style={styles.infoIcon}
            />
            <Text style={styles.titleLabel2}>
              Thời gian: {selectedDurationLabel}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome
              name="map-marker"
              size={14}
              color="#FFA726"
              style={styles.infoIcon}
            />
            <Text style={styles.titleLabel2}>Bán kính: {radius / 1000} km</Text>
          </View>
        </View>
      </View>

      {/* Suggested Plans Section */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Kế hoạch gợi ý</Text>

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 15, fontSize: 16, color: "#0000ff" }}>
              Planus đang lên kế hoạch cho bạn...
            </Text>
          </View>
        ) : (
          <FlatList
            data={suggestedPlans}
            renderItem={renderPlanCard}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.plansGrid}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.backButton, loading && { opacity: 0.5 }]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Quay lại</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
        style={[
          styles.continueButton,
          loading && { opacity: 0.5 }, 
        ]}
        onPress={handleContinue}
        disabled={loading} 
      >
        <Text style={styles.continueButtonText}>Tiếp</Text>
        <Text style={styles.continueIcon}>→</Text>
      </TouchableOpacity> */}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
  },
  headerContainer: {
    height: 150,
    position: "relative",
  },
  headerBackground: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  headerContent: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#FFF",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
    color: "#FFF",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
  },
  travelCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
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
    flexDirection: "row", // 2 phần tử xếp ngang
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  travelFrom: {
    width: "100%",
  },
  travelTo: {
    width: "100%",
    marginTop: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateIcon: {
    marginRight: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
  },
  travelLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 5,
  },
  titleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#212529",
    textAlign: "center",
    width: "100%",
    height: 40,
    lineHeight: 20,
  },
  titleLabel2: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212529",
  },
  travelDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "center",
    marginTop: 8,
  },
  travelDetails2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  travelIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  travelText: {
    fontSize: 13,
    color: "#6C757D",
    fontWeight: "500",
  },
  plansSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#212529",
    marginBottom: 10,
  },
  plansGrid: {
    paddingBottom: 20,
  },
  planCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 16,
  },
  selectedPlanCard: {
    borderColor: "#FF4444",
  },
  planImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  planInfo: {
    padding: 16,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 8,
  },
  planDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  planDuration: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  planCost: {
    fontSize: 14,
    color: "#28A745",
    fontWeight: "600",
  },
  planPlacesCount: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  planDistance: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
    marginTop: 4,
  },
  moreButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  moreButtonText: {
    fontSize: 16,
    color: "#4facfe",
    fontWeight: "600",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: "#4facfe",
    marginRight: 8,
  },
  backLabel: {
    fontSize: 14,
    color: "#4facfe",
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#4facfe",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  continueIcon: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: width - 32,
    height: 200,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  weatherCard: {
    backgroundColor: "#F8F9FA",
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: "center",
    minHeight: 45,
    flexDirection: "column",
  },
  weatherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dayLabel: {
    color: "#212529",
    fontWeight: "700",
    marginBottom: 4,
    fontSize: 12,
  },
  weatherIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tempText: {
    color: "#212529",
    fontWeight: "600",
    fontSize: 11,
  },
  weatherLabel: {
    color: "#6C757D",
    fontSize: 8,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 10,
    marginLeft: 10,
  },
  travelHalf: {
    flex: 1,
    alignItems: "center",
    maxWidth: "50%",
  },
});

export default SuggestedPlansScreen;

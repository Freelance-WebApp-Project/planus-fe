import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TravelPlan } from "../../types/plan.types";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from "expo-location";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

const CurrentRouteTrackingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { plan, visitedPlaces = [] } = route.params as {
    plan: TravelPlan;
    visitedPlaces?: number[];
  };
  const mapRef = useRef<MapView>(null);
  const [locations, setLocations] = useState<
    { name: string; address: string; lat: number; lon: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (err) {
      console.error("Error getting location", err);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 🔹 Gọi Nominatim để chuyển address -> lat/lon
  const fetchCoordinates = async (address: string) => {
    try {
      const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "TravelApp/1.0 (youremail@example.com)",
          Accept: "application/json",
        },
      });
      const data = await res.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching coordinates:", err);
      return null;
    }
  };

  // 🔹 Khi mount -> lấy toạ độ cho từng địa điểm
  useEffect(() => {
    const loadCoordinates = async () => {
      setLoading(true);
      const results: any[] = [];

      for (const item of plan.itinerary) {
        const address = item.placeInfo.location.address;
        const coords = await fetchCoordinates(address);
        if (coords) {
          results.push({
            name: item.placeInfo.name,
            address,
            lat: coords.lat,
            lon: coords.lon,
          });
        }
        await new Promise((r) => setTimeout(r, 700)); // tránh rate limit
      }

      if (results.length === 0) {
        Alert.alert("Không thể lấy vị trí từ địa chỉ!");
      }

      setLocations(results);
      setLoading(false);
    };

    loadCoordinates();
  }, []);

  // 🔹 Zoom vào địa điểm đang chọn
  useEffect(() => {
    if (locations.length > 0 && mapRef.current) {
      const loc = locations[selectedIndex];
      mapRef.current.animateToRegion(
        {
          latitude: loc.lat,
          longitude: loc.lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  }, [selectedIndex, locations]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Đang tải bản đồ...</Text>
      </View>
    );
  }

  if (locations.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy toạ độ cho các địa điểm.</Text>
      </View>
    );
  }

  const region = {
    latitude: locations[0].lat,
    longitude: locations[0].lon,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
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
        <Text style={styles.headerTitle}>Theo dõi lộ trình</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          region={region}
        >
          {locations.map((loc, i) => (
            <Marker
              key={i}
              coordinate={{ latitude: loc.lat, longitude: loc.lon }}
              title={`${i + 1}. ${loc.name}`}
              description={loc.address}
              pinColor={
                i === 0 ? "green" : i === locations.length - 1 ? "red" : "blue"
              }
            />
          ))}

          <Polyline
            coordinates={locations.map((l) => ({
              latitude: l.lat,
              longitude: l.lon,
            }))}
            strokeWidth={4}
            strokeColor="#007bff"
          />
          {location && locations.length > 0 && (
            <Polyline
              coordinates={[
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                {
                  latitude: locations[0].lat,
                  longitude: locations[0].lon,
                },
              ]}
              strokeWidth={4}
              strokeColor="#00C853" // màu xanh lá cây cho rõ
              lineDashPattern={[5, 5]} // đường gạch chấm để phân biệt
            />
          )}

          {/* Marker người hiện tại */}
          {location ? (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Vị trí của bạn"
              description="Đây là nơi bạn đang đứng"
            >
              <View
                style={[
                  styles.avatar,
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#4facfe",
                  },
                ]}
              >
                <FontAwesome name="user" size={20} color="#F0F0F0" />
              </View>
            </Marker>
          ) : null}
        </MapView>

        {/* 🔹 Thẻ địa điểm nằm ngang */}
        <View style={styles.infoBox}>
          <Text style={styles.title}>{plan.planTitle}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
          >
            {plan.itinerary.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  selectedIndex === index && styles.selectedCard,
                ]}
                onPress={() => setSelectedIndex(index)}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=60",
                    }}
                    style={styles.cardImage}
                  />

                  {/* ✅ Dấu tích ở góc trên phải */}
                  {visitedPlaces.includes(index) && (
                    <View style={styles.checkIconContainer}>
                      <FontAwesome
                        name="check-circle"
                        size={22}
                        color="#4CAF50"
                      />
                    </View>
                  )}
                </View>
                <View style={{ padding: 10 }}>
                  <View>
                    <Text style={styles.cardTitle}>{item.placeInfo.name}</Text>
                    <View style={styles.starsContainer}>
                      {[...Array(5)].map((_, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.star,
                            i < Math.round(item.placeInfo.rating)
                              ? styles.starFilled
                              : styles.starEmpty,
                          ]}
                        >
                          ★
                        </Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.price}>
                    Giá: {item.placeInfo.priceRange || "N/A"} VND
                  </Text>
                  <Text numberOfLines={2} style={styles.desc}>
                    Mô tả: {item.placeInfo.description || "Chưa có mô tả"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CurrentRouteTrackingScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  infoBox: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },
  card: {
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#007bff",
  },
  cardImage: { width: "100%", height: 130 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontWeight: "bold", fontSize: 15, color: "#111" },
  rating: { color: "#ffb400", fontWeight: "bold" },
  price: { color: "#555", fontStyle: "italic", marginTop: 4 },
  desc: { color: "#666", fontSize: 12, marginTop: 4 },
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
  imageContainer: {
    position: "relative",
  },
  checkIconContainer: {
    position: "absolute",
    top: 5,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 3,
    zIndex: 10,
  },
  starsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  star: {
    fontSize: 15,
  },
  starFilled: {
    color: "#FFD700",
  },
  starEmpty: {
    color: "#E9ECEF",
  },
  avatar: { width: 30, height: 30, borderRadius: 25, marginRight: 10 },
});

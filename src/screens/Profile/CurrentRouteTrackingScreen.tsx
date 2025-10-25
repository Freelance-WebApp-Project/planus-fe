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
import { WebView } from "react-native-webview";
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
  const mapRef = useRef(null);
  const webViewRef = useRef<WebView>(null);

  const [locations, setLocations] = useState<
    { name: string; address: string; lat: number; lon: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [mapReady, setMapReady] = useState(false);

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

  useEffect(() => {
    if (location && mapReady && webViewRef.current) {
      console.log("📡 Injecting user marker & connecting to route...");
      
      const js = `
      // Xoá marker cũ (nếu có)
      if (window.userMarker) map.removeLayer(window.userMarker);

      // Vẽ marker vị trí hiện tại
      window.userMarker = L.circleMarker(
        [${location.latitude}, ${location.longitude}],
        { radius: 7, color: '#4facfe', fillColor: '#4facfe', fillOpacity: 0.9 }
      ).addTo(map).bindPopup("📍 Bạn đang ở đây");

      // Nếu có line hành trình, nối từ vị trí hiện tại -> điểm đầu tiên
      if (window.line && window.line.length > 0) {
        const firstPoint = window.line[0];
        const extendedLine = [[${location.latitude}, ${location.longitude}], ...window.line];
        L.polyline(extendedLine, { color: '#4facfe', weight: 4, dashArray: '6,6' }).addTo(map);
      }

      map.flyTo([${location.latitude}, ${location.longitude}], 14);
      true;
    `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [location, mapReady]);

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
    if (locations.length > 0 && webViewRef.current) {
      const loc = locations[selectedIndex];
      webViewRef.current.injectJavaScript(`
      map.flyTo([${loc.lat}, ${loc.lon}], 14);
      true;
    `);
    }
  }, [selectedIndex]);

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
        <View style={StyleSheet.absoluteFillObject}>
          <WebView
            ref={webViewRef}
            onMessage={(event) => {
              console.log("📬 WebView message:", event.nativeEvent.data);
              if (event.nativeEvent.data === "MAP_READY") {
                setMapReady(true);
              }
            }}
            style={StyleSheet.absoluteFillObject}
            originWhitelist={["*"]}
            source={{
              html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
          <style>
            html, body, #map { height: 100%; margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            const start = [${locations[0].lat}, ${locations[0].lon}];
            const map = L.map('map').setView(start, 13);

            // OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Vẽ markers
            const locs = ${JSON.stringify(locations)};
            locs.forEach((l, i) => {
              const color = i === 0 ? "green" : i === locs.length - 1 ? "red" : "blue";
              L.marker([l.lat, l.lon]).addTo(map)
                .bindPopup((i+1) + ". " + l.name);
            });

            // Vẽ polyline hành trình
            window.line = locs.map(p => [p.lat, p.lon]); // 👈 gắn vào window
L.polyline(window.line, { color: '#007bff', weight: 4 }).addTo(map);
window.ReactNativeWebView.postMessage("MAP_READY");

            // Vẽ vị trí hiện tại (nếu có)
            ${
              location
                ? `
              const userMarker = L.circleMarker(
                [${location.latitude}, ${location.longitude}],
                { radius: 7, color: '#4facfe', fillColor: '#4facfe', fillOpacity: 0.9 }
              ).addTo(map).bindPopup("Bạn đang ở đây");
            `
                : ""
            }

            map.fitBounds(line);
          </script>
        </body>
        </html>
      `,
            }}
          />
        </View>

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

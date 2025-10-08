import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import { API_CONFIG } from "../../constants/api.constants";

const { width } = Dimensions.get("window");

interface CityOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
  thumbnail: string;
}

const SelectDestinationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedPurpose, selectedDuration, radius } = route.params as any;

  const [currentLocation, setCurrentLocation] = useState<string>(
    "Chưa xác định được địa điểm"
  );

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [routeCoords, setRouteCoords] = useState<any[]>([]);

  const destination = { lat: 21.027763, lng: 105.83416 };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { name: string; lat: number; lon: number }[]
  >([]);
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    lat: number;
    lon: number;
  } | null>(null);

  const cities: CityOption[] = [
    {
      id: "hochiminh",
      name: "Thành phố Hồ Chí Minh",
      lat: 10.762622,
      lng: 106.660172,
      thumbnail:
        "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: "hanoi",
      name: "Thành phố Hà Nội",
      lat: 21.027763,
      lng: 105.83416,
      thumbnail:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: "danang",
      name: "Thành phố Đà Nẵng",
      lat: 16.054407,
      lng: 108.202167,
      thumbnail:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
    {
      id: "haiphong",
      name: "Thành phố Hải Phòng",
      lat: 20.844911,
      lng: 106.688084,
      thumbnail:
        "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    },
  ];

  const [selectedDestination, setSelectedDestination] =
    useState<CityOption | null>(cities.find((c) => c.id === "hanoi") || null);

  // Hàm gọi API
  const searchLocation = async (query: string) => {
    try {
      if (!query.trim()) return [];
      const url = `${API_CONFIG.NOMINATIM_URL}/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "MyApp/1.0 (myemail@example.com)", // BẮT BUỘC với Nominatim
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        alert("Hệ thống gặp sự cố khi lấy địa chỉ từ tọa độ, vui lòng thử lại sau");
        return [];
      }

      const data = await response.json();
      return data.map((r: any) => ({
        name: r.display_name,
        lat: parseFloat(r.lat),
        lon: parseFloat(r.lon),
      }));
    } catch (err) {
      console.error("Error searching location:", err);
      return [];
    }
  };

  // Hàm xử lý khi bấm nút Search
  const handleSearch = async () => {
    if (!query.trim()) return;
    const results = await searchLocation(query);
    setResults(results);
  };

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

  const getAddressFromCoords = async (
    coords: Location.LocationObjectCoords
  ) => {
    try {
      const url = `${API_CONFIG.NOMINATIM_URL}/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "MyApp/1.0 (myemail@example.com)", // bắt buộc
        },
      });

      if (!response.ok) {
        // const text = await response.text();
        // console.error("Nominatim error:", text);
        alert("Hệ thống gặp sự cố khi lấy địa chỉ từ tọa độ, vui lòng thử lại sau");
        return;
      }

      const data = await response.json();
      const addr = data.address || {};
      const formatted = `${addr.suburb || ""}, ${
        addr.city || addr.town || addr.village || ""
      }, ${addr.state || ""}`;
      setCurrentLocation(formatted);
      setQuery(formatted);
    } catch (err) {
      console.error("Error getting address:", err);
    }
  };

  const getRoute = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ) => {
    try {
      const url = `${API_CONFIG.OSRM_URL}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      console.log("Fetching:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(
          (c: number[]) => ({
            latitude: c[1],
            longitude: c[0],
          })
        );

        console.log("Route points:", coords.length);
        setRouteCoords(coords);
      } else {
        console.warn("No route found in OSRM response:", data);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // useEffect gọi lấy tọa độ
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // useEffect gọi reverse geocode khi đã có tọa độ
  useEffect(() => {
    if (location) {
      getAddressFromCoords(location);
      getRoute(
        { lat: location.latitude, lng: location.longitude },
        destination
      );
    }
  }, [location]);

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleNext = () => {
    if (!location) {
      alert("Đang lấy vị trí hiện tại, vui lòng chờ...");
      return;
    }

    if (!selectedDestination) {
      alert("Vui lòng chọn địa điểm từ danh sách gợi ý.");
      return;
    }

    const start = selectedPlace
      ? {
          lat: selectedPlace.lat,
          lng: selectedPlace.lon,
          address: selectedPlace.name,
        }
      : {
          lat: location.latitude,
          lng: location.longitude,
          address: currentLocation,
        };

    (navigation as any).navigate("SelectScheduleScreen", {
      selectedPurpose,
      selectedDuration,
      radius,
      destination: selectedDestination,
      currentLocation,
      start,
      end: {
        lat: selectedDestination.lat,
        lng: selectedDestination.lng,
        address: selectedDestination.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn địa điểm</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <MapView
            style={styles.map}
            region={
              selectedPlace
                ? {
                    latitude: selectedPlace.lat,
                    longitude: selectedPlace.lon,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : location
                ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }
                : undefined
            }
            showsUserLocation={true}
          >
            {selectedPlace ? (
              <Marker
                coordinate={{
                  latitude: selectedPlace.lat,
                  longitude: selectedPlace.lon,
                }}
                title={selectedPlace.name}
                pinColor="blue"
              />
            ) : location ? (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Vị trí của bạn"
                description="Đây là nơi bạn đang đứng"
                pinColor="red"
              />
            ) : null}
          </MapView>

          <Text style={styles.chooseDestinationTitle}>Địa điểm của bạn</Text>

          <View style={styles.searchWrapper}>
            {/* Ô input + nút search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Nhập địa điểm..."
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                style={styles.currentLocationArrowButton}
                onPress={handleSearch}
              >
                <Text style={styles.currentLocationArrowText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Danh sách gợi ý */}
            {results.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {results.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedPlace(item);
                      setQuery(item.name);
                      setResults([]);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text numberOfLines={1} style={styles.suggestionText}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Choose Destination Section */}
          <Text style={styles.chooseDestinationTitle}>Chọn điểm đến</Text>
          <View style={styles.destinationList}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.destinationCard,
                  selectedDestination?.id === city.id &&
                    styles.selectedDestinationCard,
                ]}
                onPress={() => setSelectedDestination(city)}
              >
                <Text style={styles.destinationPinIcon}>📍</Text>
                <Text style={styles.destinationName}>{city.name}</Text>
                <Image
                  source={{ uri: city.thumbnail }}
                  style={styles.destinationThumbnail}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.navIcon}>←</Text>
            <Text style={styles.navText}>Quay lại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Tiếp</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 6,
    color: "#5A9FD8",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chevronIcon: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  notificationButton: {
    padding: 8,
  },
  bellIcon: {
    fontSize: 20,
    color: "#5A9FD8",
  },
  bannerContainer: {
    width: "100%",
    height: 180,
    marginBottom: 20,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 10,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bannerText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  currentLocationInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  currentLocationArrowButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  currentLocationArrowText: {
    fontSize: 20,
    color: "#666",
  },
  chooseDestinationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 15,
  },
  destinationList: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  destinationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  selectedDestinationCard: {
    borderColor: "#E74C3C",
    borderWidth: 2,
  },
  destinationPinIcon: {
    fontSize: 18,
    marginRight: 12,
    color: "#E74C3C",
  },
  destinationName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  destinationThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  moreButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  moreButtonText: {
    fontSize: 16,
    color: "#5A9FD8",
    fontWeight: "500",
  },
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  navIcon: {
    fontSize: 20,
    color: "#5A9FD8",
    marginRight: 8,
  },
  navText: {
    fontSize: 16,
    color: "#5A9FD8",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#5A9FD8",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#5A9FD8",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  map: {
    flex: 1,
    width: width - 32,
    height: 200,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 1,
    paddingVertical: 3,
  },
  currentLocationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 15,
    color: "#333",
  },
});

export default SelectDestinationScreen;

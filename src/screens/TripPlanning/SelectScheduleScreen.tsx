import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

// Chuyển code thời tiết sang nhãn và icon
const weatherCodeToInfo = (code: number) => {
  switch (code) {
    case 0: return { label: "Quang", icon: "star", color: "#FFD700" };
    case 1: return { label: "Chủ yếu quang", icon: "star", color: "#FFD700" };
    case 2: return { label: "Một phần mây", icon: "cloud", color: "#87CEEB" };
    case 3: return { label: "Âm u", icon: "cloud", color: "#708090" };
    case 61: return { label: "Mưa nhẹ", icon: "tint", color: "#4facfe" };
    case 63: return { label: "Mưa vừa", icon: "tint", color: "#2196F3" };
    case 65: return { label: "Mưa to", icon: "tint", color: "#1976D2" };
    case 80: return { label: "Mưa rào nhẹ", icon: "tint", color: "#4facfe" };
    case 81: return { label: "Mưa rào vừa", icon: "tint", color: "#2196F3" };
    case 82: return { label: "Mưa rào to", icon: "tint", color: "#1976D2" };
    case 95: return { label: "Dông", icon: "bolt", color: "#9C27B0" };
    case 96: return { label: "Dông + mưa đá nhẹ", icon: "bolt", color: "#7B1FA2" };
    case 99: return { label: "Dông + mưa đá to", icon: "bolt", color: "#6A1B9A" };
    default: return { label: "Không rõ", icon: "question-circle", color: "#6C757D" };
  }
};

const SelectScheduleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    start,
    end,
    selectedPurpose,
    selectedDuration,
    radius,
    destination,
    currentLocation,
  } = route.params as {
    start: Location;
    end: Location;
    selectedPurpose: string;
    selectedDuration: string;
    radius: number;
    destination: string;
    currentLocation: string;
  };

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [weatherStart, setWeatherStart] = useState<any>(null);
  const [weatherEnd, setWeatherEnd] = useState<any>(null);

  // Lấy danh sách 10 ngày tiếp theo
  const getNext10Days = () => {
    const days: { [key: string]: any } = {};
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const key = d.toISOString().split("T")[0];
      days[key] = { disabled: false };
    }
    return days;
  };

  const markedDates = {
    ...getNext10Days(),
    [selectedDate]: {
      selected: true,
      selectedColor: "#4facfe",
      selectedTextColor: "#fff",
    },
  };

  // Gọi API Open-Meteo
  const fetchWeather = async (location: Location, date: Date) => {
    const day = date.toISOString().split("T")[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&timezone=Asia/Bangkok&start_date=${day}&end_date=${day}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const weatherInfo = weatherCodeToInfo(data.daily.weathercode[0]);
      return {
        temperatureMax: data.daily.temperature_2m_max[0],
        temperatureMin: data.daily.temperature_2m_min[0],
        precipitation: data.daily.precipitation_sum[0],
        precipitationProbability: data.daily.precipitation_probability_max[0],
        weatherLabel: weatherInfo.label,
        weatherIcon: weatherInfo.icon,
        weatherColor: weatherInfo.color,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Khi chọn ngày trong Calendar
  const onDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);

    const dateObj = new Date(day.dateString);
    const startW = await fetchWeather(start, dateObj);
    const endW = await fetchWeather(end, dateObj);

    setWeatherStart(startW);
    setWeatherEnd(endW);
  };

  const handleNext = () => {
    if (!selectedDate) return alert("Vui lòng chọn ngày du lịch.");
    if (!weatherStart || !weatherEnd)
      return alert("Đang tải dữ liệu thời tiết...");

    (navigation as any).navigate("SuggestedPlans", {
      selectedPurpose,
      selectedDuration,
      radius,
      destination,
      currentLocation,
      start,
      end,
      weatherStart,
      weatherEnd,
      travelDate: selectedDate,
    });
  };

  useEffect(() => {
  const fetchInitialWeather = async () => {
    const startW = await fetchWeather(start, today);
    const endW = await fetchWeather(end, today);
    setWeatherStart(startW);
    setWeatherEnd(endW);
  };

  fetchInitialWeather();
}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn thời gian</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Lịch 10 ngày */}
          <Calendar
            current={today.toISOString().split("T")[0]}
            minDate={today.toISOString().split("T")[0]}
            maxDate={
              new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            onDayPress={onDayPress}
            markedDates={markedDates}
            theme={{
              todayTextColor: "#4facfe",
              arrowColor: "#4facfe",
            }}
          />

          {/* Điểm đi */}
          {weatherStart && (
            <View style={styles.weatherBox}>
              <Text style={styles.weatherTitle}>
                Điểm đi ({start.address})
              </Text>
              <View style={styles.weatherItem}>
                <FontAwesome name="thermometer-half" size={16} color="#4facfe" style={styles.weatherIcon} />
                <Text style={styles.weatherText}>
                  {weatherStart.temperatureMin}°C - {weatherStart.temperatureMax}°C
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <FontAwesome name="tint" size={16} color="#4facfe" style={styles.weatherIcon} />
                <Text style={styles.weatherText}>
                  {weatherStart.precipitation} mm ({weatherStart.precipitationProbability}%)
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <FontAwesome name={weatherStart.weatherIcon as any} size={16} color={weatherStart.weatherColor} style={styles.weatherIcon} />
                <Text style={styles.weatherText}>{weatherStart.weatherLabel}</Text>
              </View>
            </View>
          )}

          {/* Điểm đến */}
          {weatherEnd && (
            <View style={styles.weatherBox}>
              <Text style={styles.weatherTitle}>
                Điểm đến ({end.address})
              </Text>
              <View style={styles.weatherItem}>
                <FontAwesome name="thermometer-half" size={16} color="#4facfe" style={styles.weatherIcon} />
                <Text style={styles.weatherText}>
                  {weatherEnd.temperatureMin}°C - {weatherEnd.temperatureMax}°C
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <FontAwesome name="tint" size={16} color="#4facfe" style={styles.weatherIcon} />
                <Text style={styles.weatherText}>
                  {weatherEnd.precipitation} mm ({weatherEnd.precipitationProbability}%)
                </Text>
              </View>
              <View style={styles.weatherItem}>
                <FontAwesome name={weatherEnd.weatherIcon as any} size={16} color={weatherEnd.weatherColor} style={styles.weatherIcon} />
                <Text style={styles.weatherText}>{weatherEnd.weatherLabel}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom bar */}
        <View style={styles.bottomNavBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={20} color="#4facfe" style={styles.navIcon} />
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
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F8F8F8" },
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#212529" },
  content: { padding: 20 },
  weatherBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#4facfe",
  },
  weatherTitle: { 
    fontWeight: "700", 
    marginBottom: 16, 
    fontSize: 16,
    color: "#212529",
    textAlign: "center",
  },
  weatherItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  weatherIcon: {
    marginRight: 12,
    width: 20,
    textAlign: "center",
  },
  weatherText: {
    fontSize: 15,
    color: "#212529",
    fontWeight: "600",
    flex: 1,
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
  navItem: { flexDirection: "row", alignItems: "center", padding: 12 },
  navIcon: { marginRight: 8 },
  navText: { fontSize: 16, color: "#4facfe", fontWeight: "600" },
  nextButton: {
    backgroundColor: "#4facfe",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#4facfe",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default SelectScheduleScreen;

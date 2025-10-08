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
import { Calendar, DateData } from "react-native-calendars";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

// Chuyển code thời tiết sang nhãn
const weatherCodeToLabel = (code: number) => {
  switch (code) {
    case 0: return "Quang";
    case 1: return "Chủ yếu quang";
    case 2: return "Một phần mây";
    case 3: return "Âm u";
    case 61: return "Mưa nhẹ";
    case 63: return "Mưa vừa";
    case 65: return "Mưa to";
    case 80: return "Mưa rào nhẹ";
    case 81: return "Mưa rào vừa";
    case 82: return "Mưa rào to";
    case 95: return "Dông";
    case 96: return "Dông + mưa đá nhẹ";
    case 99: return "Dông + mưa đá to";
    default: return "Không rõ";
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
      selectedColor: "#3498db",
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
      return {
        temperatureMax: data.daily.temperature_2m_max[0],
        temperatureMin: data.daily.temperature_2m_min[0],
        precipitation: data.daily.precipitation_sum[0],
        precipitationProbability: data.daily.precipitation_probability_max[0],
        weatherLabel: weatherCodeToLabel(data.daily.weathercode[0]),
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
              todayTextColor: "#e67e22",
              arrowColor: "#3498db",
            }}
          />

          {/* Điểm đi */}
          {weatherStart && (
            <View style={styles.weatherBox}>
              <Text style={styles.weatherTitle}>
                Điểm đi ({start.address})
              </Text>
              <Text>
                🌡 {weatherStart.temperatureMin}°C -{" "}
                {weatherStart.temperatureMax}°C
              </Text>
              <Text>
                🌧 {weatherStart.precipitation} mm (
                {weatherStart.precipitationProbability}%)
              </Text>
              <Text>☀️ {weatherStart.weatherLabel}</Text>
            </View>
          )}

          {/* Điểm đến */}
          {weatherEnd && (
            <View style={styles.weatherBox}>
              <Text style={styles.weatherTitle}>
                Điểm đến ({end.address})
              </Text>
              <Text>
                🌡 {weatherEnd.temperatureMin}°C - {weatherEnd.temperatureMax}°C
              </Text>
              <Text>
                🌧 {weatherEnd.precipitation} mm (
                {weatherEnd.precipitationProbability}%)
              </Text>
              <Text>☀️ {weatherEnd.weatherLabel}</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom bar */}
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
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  weatherTitle: { fontWeight: "700", marginBottom: 8, fontSize: 15 },
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
  navIcon: { fontSize: 20, color: "#5A9FD8", marginRight: 8 },
  navText: { fontSize: 16, color: "#5A9FD8", fontWeight: "600" },
  nextButton: {
    backgroundColor: "#5A9FD8",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#5A9FD8",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});

export default SelectScheduleScreen;

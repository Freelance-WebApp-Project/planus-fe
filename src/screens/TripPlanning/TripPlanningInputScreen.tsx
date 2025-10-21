import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

const { width } = Dimensions.get("window");

const TripPlanningInputScreen = () => {
  const navigation = useNavigation();
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [radius, setRadius] = useState<number>(5);

  const purposes = [
    { id: "dating", label: "Hẹn hò", icon: "heart", color: "#FF6B6B" },
    { id: "relax", label: "Thư giãn", icon: "leaf", color: "#4ECDC4" },
    { id: "coffee", label: "Cà phê", icon: "coffee", color: "#8B4513" },
    { id: "explore", label: "Khám phá", icon: "compass", color: "#4facfe" },
    { id: "food", label: "Ẩm thực", icon: "cutlery", color: "#FFA726" },
  ];

  const durations = [
    { id: "half-day", label: "Nửa ngày", icon: "star", color: "#FFD700" },
    { id: "full-day", label: "Cả ngày", icon: "star", color: "#FF8C00" },
    { id: "multi-day", label: "Nhiều ngày", icon: "calendar", color: "#9C27B0" },
  ];

  const handlePurposeSelect = (purposeId: string) => {
    setSelectedPurpose(purposeId);
  };

  const handleDurationSelect = (durationId: string) => {
    setSelectedDuration(durationId);
  };

  const handleContinue = () => {
    if(!selectedPurpose){
      alert("Vui lòng chọn mục đích chuyến đi");
      return;
    }

    if(!selectedDuration){
      alert("Vui lòng chọn thời gian dự kiến");
      return;
    }
    
    // Navigate to destination selection screen
    (navigation as any).navigate("SelectDestination", {
      selectedPurpose,
      selectedDuration,
      radius: radius * 1000,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tạo kế hoạch chuyến đi</Text>
      </View>

      {/* Banner Image */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText}>Ngân sách</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>

          {/* Purpose Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mục đích chuyến đi</Text>
            <View style={styles.optionsContainer}>
              {purposes.map((purpose) => (
                <TouchableOpacity
                  key={purpose.id}
                  style={[
                    styles.optionButton,
                    selectedPurpose === purpose.id &&
                      styles.selectedOptionButton,
                  ]}
                  onPress={() => handlePurposeSelect(purpose.id)}
                >
                  <FontAwesome 
                    name={purpose.icon as any} 
                    size={16} 
                    color={selectedPurpose === purpose.id ? "#FFFFFF" : purpose.color} 
                    style={styles.optionIcon} 
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedPurpose === purpose.id &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {purpose.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Duration Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian dự kiến</Text>
            <View style={styles.optionsContainer}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.optionButton,
                    selectedDuration === duration.id &&
                      styles.selectedOptionButton,
                  ]}
                  onPress={() => handleDurationSelect(duration.id)}
                >
                  <FontAwesome 
                    name={duration.icon as any} 
                    size={16} 
                    color={selectedDuration === duration.id ? "#FFFFFF" : duration.color} 
                    style={styles.optionIcon} 
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedDuration === duration.id &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Radius Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bán kính di chuyển</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.radiusLabel}>{radius}Km</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={radius}
                onValueChange={setRadius}
                minimumTrackTintColor="#4facfe"
                maximumTrackTintColor="#E9ECEF"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={20} color="#4facfe" style={styles.backIcon} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Tiếp</Text>
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginRight: 4,
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#6C757D",
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
  },
  bannerContainer: {
    position: "relative",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bannerText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  inputButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  selectedOptionButton: {
    backgroundColor: "#4facfe",
    borderColor: "#4facfe",
  },
  optionIcon: {
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
  },
  selectedOptionText: {
    color: "#FFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 20,
  },
  sliderContainer: {
    alignItems: "center",
  },
  radiusLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4facfe",
    marginBottom: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  backIcon: {
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: "#4facfe",
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#4facfe",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
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
  },
});

export default TripPlanningInputScreen;

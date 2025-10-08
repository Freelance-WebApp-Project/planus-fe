import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import DateTimePicker from "@react-native-community/datetimepicker";
import { showToast } from "../../utils/toast.utils";

const { width, height } = Dimensions.get("window");

const ProfileSetupScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    { label: "Workshop", value: "workshop" },
    { label: "Xem phim", value: "xem_phim" },
    { label: "Thiên nhiên", value: "thien_nhien" },
    { label: "Du lịch", value: "du_lich" },
    { label: "Khám phá", value: "kham_pha" },
    { label: "Thể thao", value: "the_thao" },
    { label: "Sách", value: "sach" },
    { label: "Cafe", value: "cafe" },
    { label: "Điện ảnh", value: "dien_anh" },
    { label: "Ăn uống", value: "an_uong" },
    { label: "Cắm hoa", value: "cam_hoa" },
    { label: "Động vật", value: "dong_vat" },
    { label: "Boardgame", value: "boardgame" },
    { label: "Âm nhạc", value: "am_nhac" },
    { label: "Hội hoạ", value: "hoi_hoa" },
  ];

  const toggleInterest = (interestValue: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestValue)
        ? prev.filter((item) => item !== interestValue)
        : [...prev, interestValue]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    setDob(tempDate);

    // Calculate age from date of birth
    const today = new Date();
    const birthDate = new Date(tempDate);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    setAge(calculatedAge.toString());
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(dob);
    setShowDatePicker(false);
  };

  const handleNext = () => {
    // Validate required fields
    if (!fullName.trim()) {
      showToast.error("Lỗi", "Vui lòng nhập tên đầy đủ");
      return;
    }

    if (!age || age === "0") {
      showToast.error("Lỗi", "Vui lòng chọn ngày sinh hợp lệ");
      return;
    }

    if (!gender) {
      showToast.error("Lỗi", "Vui lòng chọn giới tính");
      return;
    }

    navigation.navigate("IncomeSetup", {
      profileData: {
        fullName,
        age,
        gender,
        dob: dob.toISOString(),
        interests: selectedInterests,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>PLANUS</Text>
            <Text style={styles.subtitle}>Thiết lập hồ sơ cá nhân</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>Bước 1/2</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên đầy đủ"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setTempDate(dob);
                setShowDatePicker(true);
              }}
            >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateIcon}>🎂</Text>
                <Text style={styles.dateText}>{formatDate(dob)}</Text>
                <Text style={styles.dateArrow}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "male" && styles.genderButtonSelected,
                ]}
                onPress={() => setGender("male")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "male" && styles.genderTextSelected,
                  ]}
                >
                  Nam
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === "female" && styles.genderButtonSelected,
                ]}
                onPress={() => setGender("female")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "female" && styles.genderTextSelected,
                  ]}
                >
                  Nữ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sở thích</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.interestsGrid}>
            {interests.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.interestButton,
                  selectedInterests.includes(interest.value) &&
                    styles.interestButtonSelected,
                ]}
                onPress={() => toggleInterest(interest.value)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest.value) &&
                      styles.interestTextSelected,
                  ]}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nextButton}
        >
          <TouchableOpacity
            style={styles.nextButtonTouchable}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDateCancel}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDateConfirm}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonPrimary]}
                >
                  Xong
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Date Picker */}
            <View style={styles.customDatePicker}>
              {/* Date Preview */}
              <View style={styles.datePreview}>
                <Text style={styles.datePreviewText}>
                  {formatDate(tempDate)}
                </Text>
                <Text style={styles.datePreviewAge}>
                  Tuổi:{" "}
                  {(() => {
                    const today = new Date();
                    const birthDate = new Date(tempDate);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && today.getDate() < birthDate.getDate())
                    ) {
                      age--;
                    }
                    return age;
                  })()}
                </Text>
              </View>

              {/* Year Selection */}
              <View style={styles.yearSection}>
                <Text style={styles.sectionLabel}>Năm</Text>
                <View style={styles.yearControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(newDate.getFullYear() - 10);
                      setTempDate(newDate);
                    }}
                  >
                    <Text style={styles.controlButtonText}>-10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(newDate.getFullYear() - 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Text style={styles.controlButtonText}>-1</Text>
                  </TouchableOpacity>
                  <View style={styles.currentValue}>
                    <Text style={styles.currentValueText}>
                      {tempDate.getFullYear()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(newDate.getFullYear() + 1);
                      setTempDate(newDate);
                    }}
                  >
                    <Text style={styles.controlButtonText}>+1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      const newDate = new Date(tempDate);
                      newDate.setFullYear(newDate.getFullYear() + 10);
                      setTempDate(newDate);
                    }}
                  >
                    <Text style={styles.controlButtonText}>+10</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Month Selection */}
              <View style={styles.monthSection}>
                <Text style={styles.sectionLabel}>Tháng</Text>
                <View style={styles.monthGrid}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNames = [
                      "T1",
                      "T2",
                      "T3",
                      "T4",
                      "T5",
                      "T6",
                      "T7",
                      "T8",
                      "T9",
                      "T10",
                      "T11",
                      "T12",
                    ];
                    const isSelected = tempDate.getMonth() === i;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.monthButton,
                          isSelected && styles.monthButtonSelected,
                        ]}
                        onPress={() => {
                          const newDate = new Date(tempDate);
                          newDate.setMonth(i);
                          setTempDate(newDate);
                        }}
                      >
                        <Text
                          style={[
                            styles.monthButtonText,
                            isSelected && styles.monthButtonTextSelected,
                          ]}
                        >
                          {monthNames[i]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Day Selection */}
              <View style={styles.daySection}>
                <Text style={styles.sectionLabel}>Ngày</Text>
                <View style={styles.dayGrid}>
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1;
                    const isSelected = tempDate.getDate() === day;
                    const isValidDay =
                      new Date(
                        tempDate.getFullYear(),
                        tempDate.getMonth() + 1,
                        0
                      ).getDate() >= day;

                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dayButton,
                          isSelected && styles.dayButtonSelected,
                          !isValidDay && styles.dayButtonDisabled,
                        ]}
                        onPress={() => {
                          if (isValidDay) {
                            const newDate = new Date(tempDate);
                            newDate.setDate(day);
                            setTempDate(newDate);
                          }
                        }}
                        disabled={!isValidDay}
                      >
                        <Text
                          style={[
                            styles.dayButtonText,
                            isSelected && styles.dayButtonTextSelected,
                            !isValidDay && styles.dayButtonTextDisabled,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 3,
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "500",
  },
  progressContainer: {
    alignItems: "center",
    width: "100%",
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 10,
    marginBottom: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 56,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: "#9E9E9E",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    minHeight: 56,
  },
  genderButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  genderText: {
    fontSize: 16,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  genderTextSelected: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  dateButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 56,
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 10,
    color: "#9E9E9E",
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  dateArrow: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for iPhone
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#9E9E9E",
  },
  modalButtonPrimary: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  datePicker: {
    height: 200,
  },
  datePreview: {
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  datePreviewText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 4,
  },
  datePreviewAge: {
    fontSize: 14,
    color: "#666666",
  },
  yearNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  yearButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: "center",
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  currentYear: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    paddingHorizontal: 16,
  },
  customDatePicker: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 12,
    marginTop: 16,
  },
  yearSection: {
    marginBottom: 20,
  },
  yearControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: "center",
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2196F3",
  },
  currentValue: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: "center",
  },
  currentValueText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  monthSection: {
    marginBottom: 20,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  monthButton: {
    width: (width - 100) / 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  monthButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  monthButtonText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  monthButtonTextSelected: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  daySection: {
    marginBottom: 20,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayButton: {
    width: (width - 100) / 7,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dayButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  dayButtonDisabled: {
    backgroundColor: "#F0F0F0",
    borderColor: "#D0D0D0",
  },
  dayButtonText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  dayButtonTextSelected: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  dayButtonTextDisabled: {
    color: "#CCCCCC",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestButton: {
    width: (width - 80) / 3,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    minHeight: 48,
  },
  interestButtonSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  interestText: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
  },
  interestTextSelected: {
    color: "#2196F3",
    fontWeight: "600",
  },
  bottomNav: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#E3F2FD",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  nextButton: {
    borderRadius: 16,
    width: "100%",
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonTouchable: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 0,
  },
  nextButtonIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
});

export default ProfileSetupScreen;

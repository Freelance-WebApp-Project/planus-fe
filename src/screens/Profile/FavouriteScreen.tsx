import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

export const PLAN_PURPOSES = [
  { id: "1", label: "Hẹn hò", icon: "💕" },
  { id: "2", label: "Thư giãn", icon: "🧘" },
  { id: "3", label: "Cà phê", icon: "☕" },
  { id: "4", label: "Du lịch", icon: "🗺️" },
  { id: "5", label: "Công việc", icon: "💼" },
  { id: "6", label: "Gia đình", icon: "👨‍👩‍👧‍👦" },
  { id: "7", label: "Bạn bè", icon: "👯" },
  { id: "8", label: "Một mình", icon: "🧍" },
  { id: "9", label: "Học tập", icon: "📚" },
  { id: "10", label: "Thể thao", icon: "⚽" },
];

const FavouriteScreen = ({ navigation }: any) => {
  // lưu id của mục đã chọn
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    console.log("Sở thích đã chọn:", selected);
    // // Lưu vào AsyncStorage hoặc gửi lên API ở đây nếu cần
    // navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn sở thích của bạn</Text>
      <Text style={styles.subtitle}>Nhận đề xuất video phù hợp hơn</Text>

      <FlatList
        data={PLAN_PURPOSES}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => toggleSelect(item.id)}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            selected.length === 0 && styles.nextDisabled,
          ]}
          onPress={handleNext}
          disabled={selected.length === 0}
        >
          <Text
            style={[
              styles.nextText,
              selected.length === 0 && styles.nextTextDisabled,
            ]}
          >
            Tiếp
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FavouriteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
    marginBottom: 24,
  },
  listContainer: {
    paddingBottom: 40,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 8,
    marginLeft: 0,
    alignSelf: "flex-start",
  },
  itemSelected: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  labelSelected: {
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  skipButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#f2f2f2",
  },
  skipText: {
    fontSize: 16,
    color: "#000",
  },
  nextButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#000",
  },
  nextDisabled: {
    backgroundColor: "#ccc",
  },
  nextText: {
    fontSize: 16,
    color: "#fff",
  },
  nextTextDisabled: {
    color: "#eee",
  },
});

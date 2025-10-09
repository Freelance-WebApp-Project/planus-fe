import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "../../utils/toast.utils";

const { width } = Dimensions.get("window");

interface Voucher {
  id: string;
  title: string;
  description: string;
  discount: number;
  discountType: "percentage" | "amount";
  minOrderAmount: number;
  maxDiscountAmount?: number;
  pointsRequired: number;
  expiryDate: string;
  image: string;
  category: string;
  isRedeemed: boolean;
  isExpired: boolean;
}

const VoucherScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(1250);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "Tất cả", icon: "list" },
    { id: "food", label: "Ẩm thực", icon: "cutlery" },
    { id: "travel", label: "Du lịch", icon: "plane" },
    { id: "shopping", label: "Mua sắm", icon: "shopping-bag" },
    { id: "entertainment", label: "Giải trí", icon: "gamepad" },
  ];

  const mockVouchers: Voucher[] = [
    {
      id: "1",
      title: "Giảm 20% đơn hàng",
      description: "Giảm giá cho đơn hàng từ 100.000đ",
      discount: 20,
      discountType: "percentage",
      minOrderAmount: 100000,
      maxDiscountAmount: 50000,
      pointsRequired: 200,
      expiryDate: "2024-12-31",
      image: "https://via.placeholder.com/300x150/FF6B6B/FFFFFF?text=20%25",
      category: "food",
      isRedeemed: false,
      isExpired: false,
    },
    {
      id: "2",
      title: "Giảm 50.000đ",
      description: "Giảm giá cố định cho đơn hàng từ 200.000đ",
      discount: 50000,
      discountType: "amount",
      minOrderAmount: 200000,
      pointsRequired: 300,
      expiryDate: "2024-12-31",
      image: "https://via.placeholder.com/300x150/4ECDC4/FFFFFF?text=50K",
      category: "shopping",
      isRedeemed: false,
      isExpired: false,
    },
    {
      id: "3",
      title: "Giảm 15% tour du lịch",
      description: "Giảm giá cho các tour du lịch trong nước",
      discount: 15,
      discountType: "percentage",
      minOrderAmount: 500000,
      maxDiscountAmount: 100000,
      pointsRequired: 500,
      expiryDate: "2024-12-31",
      image: "https://via.placeholder.com/300x150/45B7D1/FFFFFF?text=15%25",
      category: "travel",
      isRedeemed: true,
      isExpired: false,
    },
    {
      id: "4",
      title: "Giảm 30% vé xem phim",
      description: "Giảm giá cho vé xem phim tại các rạp",
      discount: 30,
      discountType: "percentage",
      minOrderAmount: 50000,
      maxDiscountAmount: 20000,
      pointsRequired: 150,
      expiryDate: "2024-11-30",
      image: "https://via.placeholder.com/300x150/96CEB4/FFFFFF?text=30%25",
      category: "entertainment",
      isRedeemed: false,
      isExpired: false,
    },
    {
      id: "5",
      title: "Giảm 100.000đ",
      description: "Giảm giá lớn cho đơn hàng từ 500.000đ",
      discount: 100000,
      discountType: "amount",
      minOrderAmount: 500000,
      pointsRequired: 800,
      expiryDate: "2024-12-31",
      image: "https://via.placeholder.com/300x150/FFEAA7/FFFFFF?text=100K",
      category: "shopping",
      isRedeemed: false,
      isExpired: false,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVouchers(mockVouchers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredVouchers = selectedCategory === "all" 
    ? vouchers 
    : vouchers.filter(voucher => voucher.category === selectedCategory);

  const handleRedeemVoucher = (voucher: Voucher) => {
    if (voucher.isRedeemed) {
      showToast.error("Lỗi", "Voucher này đã được đổi");
      return;
    }

    if (voucher.isExpired) {
      showToast.error("Lỗi", "Voucher này đã hết hạn");
      return;
    }

    if (userPoints < voucher.pointsRequired) {
      showToast.error("Lỗi", "Bạn không đủ điểm để đổi voucher này");
      return;
    }

    Alert.alert(
      "Xác nhận đổi voucher",
      `Bạn có chắc chắn muốn đổi voucher "${voucher.title}" với ${voucher.pointsRequired} điểm?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đổi ngay",
          onPress: () => {
            // Update voucher status
            setVouchers(prevVouchers =>
              prevVouchers.map(v =>
                v.id === voucher.id ? { ...v, isRedeemed: true } : v
              )
            );
            
            // Update user points
            setUserPoints(prev => prev - voucher.pointsRequired);
            
            showToast.success("Thành công", "Đổi voucher thành công!");
          },
        },
      ]
    );
  };

  const renderVoucherCard = ({ item }: { item: Voucher }) => {
    const canRedeem = !item.isRedeemed && !item.isExpired && userPoints >= item.pointsRequired;
    
    return (
      <View style={styles.voucherCard}>
        <Image source={{ uri: item.image }} style={styles.voucherImage} />
        
        <View style={styles.voucherContent}>
          <View style={styles.voucherHeader}>
            <Text style={styles.voucherTitle}>{item.title}</Text>
            <View style={styles.pointsContainer}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.pointsText}>{item.pointsRequired}</Text>
            </View>
          </View>
          
          <Text style={styles.voucherDescription}>{item.description}</Text>
          
          <View style={styles.voucherDetails}>
            <View style={styles.detailRow}>
              <FontAwesome name="calendar" size={12} color="#666" />
              <Text style={styles.detailText}>HSD: {item.expiryDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome name="money" size={12} color="#666" />
              <Text style={styles.detailText}>
                Đơn tối thiểu: {item.minOrderAmount.toLocaleString()}đ
              </Text>
            </View>
          </View>
          
          <View style={styles.voucherFooter}>
            {item.isRedeemed ? (
              <View style={styles.redeemedBadge}>
                <FontAwesome name="check" size={12} color="#4CAF50" />
                <Text style={styles.redeemedText}>Đã đổi</Text>
              </View>
            ) : item.isExpired ? (
              <View style={styles.expiredBadge}>
                <FontAwesome name="times" size={12} color="#F44336" />
                <Text style={styles.expiredText}>Hết hạn</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  !canRedeem && styles.redeemButtonDisabled
                ]}
                onPress={() => handleRedeemVoucher(item)}
                disabled={!canRedeem}
              >
                <Text style={[
                  styles.redeemButtonText,
                  !canRedeem && styles.redeemButtonTextDisabled
                ]}>
                  {canRedeem ? "Đổi ngay" : "Không đủ điểm"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryButton = (category: any, index: number) => {
    const isSelected = selectedCategory === category.id;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryButton,
          isSelected && styles.categoryButtonSelected
        ]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <FontAwesome 
          name={category.icon as any} 
          size={16} 
          color={isSelected ? "#FFFFFF" : "#4facfe"} 
        />
        <Text style={[
          styles.categoryButtonText,
          isSelected && styles.categoryButtonTextSelected
        ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4facfe" />
          <Text style={styles.loadingText}>Đang tải voucher...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voucher & Ưu đãi</Text>
          <View style={styles.pointsDisplay}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.pointsDisplayText}>{userPoints}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category, index) => renderCategoryButton(category, index))}
        </ScrollView>
      </View>

      {/* Vouchers List */}
      <FlatList
        data={filteredVouchers}
        renderItem={renderVoucherCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.vouchersList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="gift" size={60} color="#CCCCCC" />
            <Text style={styles.emptyText}>Không có voucher nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingVertical: 20,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  pointsDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsDisplayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  categoriesContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    minHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    alignItems: "center",
    minHeight: 50,
    flexGrow: 1,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4facfe",
    backgroundColor: "#FFFFFF",
    minWidth: 90,
    height: 40,
    justifyContent: "center",
  },
  categoryButtonSelected: {
    backgroundColor: "#4facfe",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4facfe",
    marginLeft: 6,
    textAlign: "center",
    flexShrink: 0,
  },
  categoryButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  vouchersList: {
    padding: 20,
  },
  voucherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voucherImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  voucherContent: {
    padding: 16,
  },
  voucherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#856404",
    marginLeft: 4,
  },
  voucherDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  voucherDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  voucherFooter: {
    alignItems: "flex-end",
  },
  redeemButton: {
    backgroundColor: "#4facfe",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  redeemButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  redeemButtonTextDisabled: {
    color: "#999",
  },
  redeemedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  redeemedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CAF50",
    marginLeft: 4,
  },
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F44336",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});

export default VoucherScreen;

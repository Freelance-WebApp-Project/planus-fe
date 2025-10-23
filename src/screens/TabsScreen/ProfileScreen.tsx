import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../../hoc/AuthContext";
import { showToast } from "../../utils/toast.utils";
import { userService } from "../../services/user.service";
import { useWallet } from "../../hooks/useWallet";
import { User } from "../../types/auth.types";
import PremiumPopup from "./PremiumPopup";

const { width } = Dimensions.get("window");

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, isLoading, setUser } = useAuth();
  const { buyVip, loading: walletLoading } = useWallet();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [userPoints, setUserPoints] = useState(1250);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    gender: "",
    phone: "",
    income: "",
  });
  const [isPremiumPopupVisible, setIsPremiumPopupVisible] = useState(false);

  const { balance } = useWallet();

  // Fetch current user data from API
  const fetchCurrentUser = async () => {
    setIsLoadingUser(true);
    try {
      const response = await userService.getMe();
      if (response.success && response.data) {
        setCurrentUser(response.data);
        // Also update the context user
        setUser(response.data);
      } else {
        showToast.error("Lỗi", "Không thể tải thông tin người dùng");
      }
    } catch (error) {
      showToast.error("Lỗi", "Có lỗi xảy ra khi tải thông tin");
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showToast.success("Thành công", "Đăng xuất thành công");
    } catch (error) {
      showToast.error("Lỗi", "Có lỗi xảy ra khi đăng xuất");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPremiumEndDate = (dateString: string) => {
    if (!dateString) return "Chưa có";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return "Đã hết hạn";
    } else if (diffDays === 1) {
      return "Hết hạn ngày mai";
    } else if (diffDays <= 7) {
      return `Còn ${diffDays} ngày`;
    } else {
      return formatDate(dateString);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "Chưa cập nhật";
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const openEditModal = () => {
    setEditData({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      gender: currentUser?.gender || "",
      phone: currentUser?.phone || "",
      income: currentUser?.income?.toString() || "",
    });
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditData({
      fullName: "",
      email: "",
      gender: "",
      phone: "",
      income: "",
    });
  };

  const handleUpdateProfile = async () => {
    if (!editData.fullName.trim()) {
      showToast.error("Lỗi", "Vui lòng nhập tên đầy đủ");
      return;
    }

    if (!editData.email.trim()) {
      showToast.error("Lỗi", "Vui lòng nhập email");
      return;
    }

    try {
      setIsUpdating(true);

      const updateData = {
        fullName: editData.fullName.trim(),
        email: editData.email.trim(),
        gender: editData.gender,
        dob: currentUser?.dob || {},
        income: editData.income
          ? parseInt(editData.income)
          : currentUser?.income,
        favorites: currentUser?.favorites || [],
      };

      const response = await userService.updateProfile(updateData);

      if (response.success) {
        // Update user in context and local state
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            fullName: editData.fullName.trim(),
            email: editData.email.trim(),
            gender: editData.gender,
            phone: editData.phone,
            income: editData.income
              ? parseInt(editData.income)
              : currentUser.income,
          };

          setCurrentUser(updatedUser);
          setUser(updatedUser);
        }
        showToast.success("Thành công", "Cập nhật hồ sơ thành công");
        closeEditModal();
      } else {
        const errorMessage =
          response.error?.message || "Có lỗi xảy ra khi cập nhật hồ sơ";
        showToast.error("Lỗi", errorMessage);
      }
    } catch (error) {
      showToast.error("Lỗi", "Có lỗi xảy ra khi cập nhật hồ sơ");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePremiumSubscribe = async (plan: "monthly" | "yearly") => {
    try {
      const vipData = {
        amount: plan === "monthly" ? 50000 : 500000, // 50k for 1 month, 500k for 12 months
        months: plan === "monthly" ? 1 : 12,
      };

      const result = await buyVip(vipData);

      if (result) {
        showToast.success(
          "Thành công",
          `Đăng ký Premium ${
            plan === "monthly" ? "hàng tháng" : "hàng năm"
          } thành công!`
        );
        setIsPremiumPopupVisible(false);

        // Update user premium status
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            isPremium: true,
            premiumEndDate: new Date(
              Date.now() + (plan === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
            ).toISOString(),
          };
          setCurrentUser(updatedUser);
          setUser(updatedUser);
        }
      } else {
        showToast.error("Lỗi", "Không thể mua gói Premium");
      }
    } catch (error) {
      showToast.error("Lỗi", "Có lỗi xảy ra khi mua Premium");
    }
  };

  const isPremiumUser = currentUser?.isPremium || false;

  if (isLoading || isLoadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#4facfe", "#00f2fe"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesome name="user" size={32} color="#4facfe" />
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {currentUser?.fullName || "Chưa cập nhật"}
              </Text>
              <Text style={styles.userEmail}>
                {currentUser?.email || "Chưa cập nhật"}
              </Text>
              <View style={styles.pointsDisplay}>
                <FontAwesome name="star" size={16} color="#FFD700" />
                <Text style={styles.pointsDisplayText}>{balance?.point}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Premium Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản Premium</Text>

          <View style={styles.premiumCard}>
            <View style={styles.premiumInfo}>
              <View style={styles.premiumIcon}>
                <FontAwesome name="star" size={24} color="#FFD700" />
              </View>
              <View style={styles.premiumDetails}>
                <Text style={styles.premiumTitle}>
                  {isPremiumUser
                    ? "Premium Active"
                    : "Nâng cấp tài khoản Premium"}
                </Text>
                <Text style={styles.premiumSubtitle}>
                  {isPremiumUser
                    ? `Tài khoản Premium của bạn đang hoạt động`
                    : "Mở khóa tất cả tính năng cao cấp"}
                </Text>
                {isPremiumUser && currentUser?.premiumEndDate && (
                  <Text style={styles.premiumEndDate}>
                    {formatPremiumEndDate(currentUser.premiumEndDate)}
                  </Text>
                )}
              </View>
            </View>
            {!isPremiumUser && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => setIsPremiumPopupVisible(true)}
              >
                <Text style={styles.premiumButtonText}>Nâng cấp</Text>
                <FontAwesome
                  name="arrow-right"
                  size={14}
                  color="#000"
                  style={styles.premiumButtonArrow}
                />
              </TouchableOpacity>
            )}
            {isPremiumUser && (
              <View style={styles.premiumActiveBadge}>
                <FontAwesome name="check" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ví điện tử</Text>

          <View style={styles.walletCard}>
            <View style={styles.walletInfo}>
              <View style={styles.walletIcon}>
                <FontAwesome name="credit-card" size={24} color="#4facfe" />
              </View>
              <View style={styles.walletDetails}>
                <Text style={styles.walletTitle}>Ví PLANUS</Text>
                <Text style={styles.walletSubtitle}>
                  Quản lý tài chính của bạn
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.walletButton}
              onPress={() => navigation.navigate("Wallet")}
            >
              <Text style={styles.walletButtonText}>Xem ví</Text>
              <FontAwesome
                name="arrow-right"
                size={14}
                color="#FFFFFF"
                style={styles.walletButtonArrow}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Voucher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đổi điểm lấy voucher</Text>

          <View style={styles.voucherCard}>
            <View style={styles.voucherInfo}>
              <View style={styles.voucherIcon}>
                <FontAwesome name="gift" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.voucherDetails}>
                <Text style={styles.voucherTitle}>Voucher & Ưu đãi</Text>
                <Text style={styles.voucherSubtitle}>
                  Đổi điểm tích lũy thành voucher giảm giá
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.voucherButton}
              onPress={() => navigation.navigate("VoucherScreen")}
            >
              <Text style={styles.voucherButtonText}>Xem voucher</Text>
              <FontAwesome
                name="arrow-right"
                size={14}
                color="#FFFFFF"
                style={styles.voucherButtonArrow}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Travel History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử chuyến đi</Text>

          <View style={styles.historyCard}>
            <View style={styles.historyInfo}>
              <View style={styles.historyIcon}>
                <FontAwesome name="map" size={24} color="#4CAF50" />
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyTitle}>Chuyến đi đã thanh toán</Text>
                <Text style={styles.historySubtitle}>
                  Xem lại các kế hoạch đã mua
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => navigation.navigate("TravelHistory")}
            >
              <Text style={styles.historyButtonText}>Xem lịch sử</Text>
              <FontAwesome
                name="arrow-right"
                size={14}
                color="#FFFFFF"
                style={styles.historyButtonArrow}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>
                {currentUser?.fullName || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {currentUser?.email || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>
                {currentUser?.gender === "male" ? "Nam" : "Nữ"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>
                {formatDate(currentUser?.dob || "")}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>
                {currentUser?.phone || "Chưa cập nhật"}
              </Text>
            </View>
          </View>
        </View>

        {/* Income Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thu nhập</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thu nhập</Text>
              <Text style={styles.infoValue}>
                {currentUser?.income
                  ? formatCurrency(currentUser.income)
                  : "Chưa cập nhật"}
              </Text>
            </View>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sở thích</Text>

          <View style={styles.infoCard}>
            {currentUser?.favorites && currentUser.favorites.length > 0 ? (
              <View style={styles.interestsContainer}>
                {currentUser.favorites.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>Chưa cập nhật sở thích</Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeEditModal}>
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={isUpdating}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonPrimary]}
                >
                  {isUpdating ? "Đang cập nhật..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.fullName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, fullName: text })
                  }
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.email}
                  onChangeText={(text) =>
                    setEditData({ ...editData, email: text })
                  }
                  placeholder="Nhập email"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giới tính</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editData.gender === "male" && styles.genderButtonSelected,
                    ]}
                    onPress={() => setEditData({ ...editData, gender: "male" })}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        editData.gender === "male" &&
                          styles.genderButtonTextSelected,
                      ]}
                    >
                      Nam
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      editData.gender === "female" &&
                        styles.genderButtonSelected,
                    ]}
                    onPress={() =>
                      setEditData({ ...editData, gender: "female" })
                    }
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        editData.gender === "female" &&
                          styles.genderButtonTextSelected,
                      ]}
                    >
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.phone}
                  onChangeText={(text) =>
                    setEditData({ ...editData, phone: text })
                  }
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Income */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thu nhập (VND)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.income.toString()}
                  onChangeText={(text) =>
                    setEditData({ ...editData, income: text })
                  }
                  placeholder="Nhập thu nhập"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            {isUpdating && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4facfe" />
                <Text style={styles.loadingText}>Đang cập nhật...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Premium Popup */}
      <PremiumPopup
        visible={isPremiumPopupVisible}
        onClose={() => setIsPremiumPopupVisible(false)}
        onSubscribe={handlePremiumSubscribe}
        isLoading={walletLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  header: {
    paddingVertical: 30,
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
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
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
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  interestTag: {
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: "#4facfe",
    fontWeight: "500",
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  editButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#4facfe",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  editButtonText: {
    color: "#4facfe",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF5722",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#666",
  },
  modalButtonPrimary: {
    color: "#4facfe",
    fontWeight: "bold",
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  genderButtonSelected: {
    backgroundColor: "#4facfe",
    borderColor: "#4facfe",
  },
  genderButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  genderButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Wallet styles
  walletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  walletIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  walletDetails: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#4facfe",
    borderRadius: 8,
  },
  walletButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: 4,
  },
  walletButtonArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  // Premium styles
  premiumCard: {
    backgroundColor: "#1A1A1A", // đen sâu hơn
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD700", // viền vàng gold
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },

  premiumInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  premiumIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(255,215,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumDetails: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textShadowColor: "rgba(255, 215, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1.5,
  },

  premiumSubtitle: {
    fontSize: 12,
    color: "#F0F0F0",
    fontWeight: "500",
    lineHeight: 16,
  },

  premiumEndDate: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 3,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: "#FFD700",
    borderRadius: 18,
    shadowColor: "#FFD700",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  premiumButtonText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "700",
    marginRight: 5,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  premiumButtonArrow: {
    marginLeft: 4,
  },

  premiumActiveBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  // Voucher styles
  voucherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  voucherInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  voucherIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  voucherDetails: {
    flex: 1,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  voucherSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  voucherButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
  },
  voucherButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: 4,
  },
  voucherButtonArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Travel History styles
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  historyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: "#666",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  historyButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: 4,
  },
  historyButtonArrow: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default ProfileScreen;

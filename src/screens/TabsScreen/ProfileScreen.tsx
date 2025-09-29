import React, { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hoc/AuthContext";
import { showToast } from "../../utils/toast.utils";
import { userService } from "../../services/user.service";
import PremiumPopup from "./PremiumPopup";

const { width } = Dimensions.get("window");

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, isLoading, setUser } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    gender: "",
    phone: "",
    income: "",
  });
  const [isPremiumPopupVisible, setIsPremiumPopupVisible] = useState(false);

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

  const formatCurrency = (amount: number) => {
    if (!amount) return "Chưa cập nhật";
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const openEditModal = () => {
    setEditData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      gender: user?.gender || "",
      phone: user?.phone || "",
      income: user?.income || "",
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
        dob: user?.dob || {},
        income: editData.income ? parseInt(editData.income) : user?.income,
        favorites: user?.favorites || [],
      };

      const response = await userService.updateProfile(updateData);

      if (response.success) {
        // Update user in context
        if (user) {
          const updatedUser = {
            ...user,
            fullName: editData.fullName.trim(),
            email: editData.email.trim(),
            gender: editData.gender,
            phone: editData.phone,
            income: editData.income ? parseInt(editData.income) : user.income,
          };

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

  const handlePremiumSubscribe = (plan: "monthly" | "yearly") => {
    // In real app, this would call API to subscribe to premium
    console.log("Subscribing to premium plan:", plan);
    showToast.success(
      "Thành công",
      `Đăng ký Premium ${
        plan === "monthly" ? "hàng tháng" : "hàng năm"
      } thành công!`
    );
  };

  const isPremiumUser = user?.isPremium || false;

  if (isLoading) {
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
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || "👤"}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {user?.fullName || "Chưa cập nhật"}
          </Text>
          <Text style={styles.userEmail}>{user?.email || "Chưa cập nhật"}</Text>
        </View>

        {/* Premium Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản Premium</Text>

          <View style={styles.premiumCard}>
            <View style={styles.premiumInfo}>
              <View style={styles.premiumIcon}>
                <Text style={styles.premiumIconText}>👑</Text>
              </View>
              <View style={styles.premiumDetails}>
                <Text style={styles.premiumTitle}>
                  {isPremiumUser ? "Premium Active" : "Upgrade to Premium"}
                </Text>
                <Text style={styles.premiumSubtitle}>
                  {isPremiumUser
                    ? "Tài khoản Premium của bạn đang hoạt động"
                    : "Mở khóa tất cả tính năng cao cấp"}
                </Text>
              </View>
            </View>
            {!isPremiumUser && (
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => setIsPremiumPopupVisible(true)}
              >
                <Text style={styles.premiumButtonText}>Nâng cấp</Text>
                <Text style={styles.premiumButtonArrow}>→</Text>
              </TouchableOpacity>
            )}
            {isPremiumUser && (
              <View style={styles.premiumActiveBadge}>
                <Text style={styles.premiumActiveText}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>
                {user?.fullName || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {user?.email || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>
                {user?.gender === "male" ? "Nam" : "Nữ"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>
                {formatDate(user?.dob || "")}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>
                {user?.phone || "Chưa cập nhật"}
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
                {user?.income ? formatCurrency(user.income) : "Chưa cập nhật"}
              </Text>
            </View>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sở thích</Text>

          <View style={styles.infoCard}>
            {user?.favorites && user.favorites.length > 0 ? (
              <View style={styles.interestsContainer}>
                {user.favorites.map((interest, index) => (
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

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ví điện tử</Text>

          <View style={styles.walletCard}>
            <View style={styles.walletInfo}>
              <View style={styles.walletIcon}>
                <Text style={styles.walletIconText}>💳</Text>
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
              <Text style={styles.walletButtonArrow}>→</Text>
            </TouchableOpacity>
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
                <ActivityIndicator size="large" color="#2196F3" />
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
    backgroundColor: "#2196F3",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
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
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2196F3",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
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
    color: "#2196F3",
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
    borderColor: "#2196F3",
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
    color: "#2196F3",
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
    color: "#2196F3",
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
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
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
  walletIconText: {
    fontSize: 24,
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
    backgroundColor: "#2196F3",
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
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  premiumInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  premiumIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  premiumIconText: {
    fontSize: 24,
  },
  premiumDetails: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFD700",
    borderRadius: 8,
  },
  premiumButtonText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginRight: 4,
  },
  premiumButtonArrow: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  premiumActiveBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumActiveText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default ProfileScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hoc/AuthContext";
import { showToast } from "../../utils/toast.utils";
import { useWallet } from "../../hooks/useWallet";

const { width, height } = Dimensions.get("window");

const WalletScreen = ({ navigation }: any) => {
  const { user, isLoading } = useAuth();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    balance,
    transactions,
    loading: walletLoading,
    error: walletError,
    refresh,
    createCheckout,
  } = useWallet();

  const onRefresh = async () => {
    try {
      await refresh();
      showToast.success("Thành công", "Cập nhật số dư thành công");
    } catch (error) {
      showToast.error("Lỗi", "Không thể cập nhật số dư");
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handleDepositConfirm = async () => {
    const amount = parseInt(depositAmount.replace(/[^0-9]/g, ""));

    if (!amount || amount < 5000) {
      Alert.alert("Lỗi", "Số tiền tối thiểu là 5,000 VND");
      return;
    }

    if (amount > 10000000) {
      Alert.alert("Lỗi", "Số tiền tối đa là 10,000,000 VND");
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutData = {
        amount: amount,
      };

      const result = await createCheckout(checkoutData);
      if (result) {
        setShowDepositModal(false);
        setDepositAmount("");
        showToast.success("Thành công", "Đã tạo link thanh toán");
        const paymentLink = result?.paymentLink;
        
        // Open payment link in browser
        try {
          const canOpen = await Linking.canOpenURL(paymentLink);
          if (canOpen) {
            await Linking.openURL(paymentLink);
          } else {
            showToast.error("Lỗi", "Không thể mở link thanh toán");
          }
        } catch (error) {
          showToast.error("Lỗi", "Không thể mở link thanh toán");
        }
      }
    } catch (error) {
      showToast.error("Lỗi", "Không thể tạo thanh toán");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepositCancel = () => {
    setShowDepositModal(false);
    setDepositAmount("");
  };

  const formatAmountInput = (text: string) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, "");

    if (numericValue === "") {
      setDepositAmount("");
      return;
    }

    // Format with commas
    const formattedValue = parseInt(numericValue).toLocaleString("vi-VN");
    setDepositAmount(formattedValue);
  };

  const handleHistory = () => {
    // Navigate to transaction history screen
    navigation.navigate("TransactionHistory");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error toast if there's a wallet error
  if (walletError) {
    showToast.error("Lỗi", walletError);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={walletLoading}
            onRefresh={onRefresh}
            colors={["#2196F3"]}
            tintColor="#2196F3"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ví điện tử</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility}>
              <Text style={styles.eyeIcon}>
                {isBalanceVisible ? "👁️" : "🙈"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceAmount}>
            <Text style={styles.balanceText}>
              {isBalanceVisible
                ? formatCurrency(balance?.balance || 0)
                : "•••••••• VND"}
            </Text>
          </View>

          <View style={styles.balanceFooter}>
            <Text style={styles.balanceSubtext}>
              {isBalanceVisible
                ? "Cập nhật lần cuối: Hôm nay"
                : "Nhấn để xem số dư"}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeposit}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>💳</Text>
              </View>
              <Text style={styles.actionText}>Nạp tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleHistory}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📊</Text>
              </View>
              <Text style={styles.actionText}>Lịch sử</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>

          <View style={styles.transactionsCard}>
            {walletLoading ? (
              <View style={styles.transactionLoadingContainer}>
                <ActivityIndicator size="small" color="#2196F3" />
                <Text style={styles.transactionLoadingText}>
                  Đang tải giao dịch...
                </Text>
              </View>
            ) : transactions && transactions.length > 0 ? (
              <>
                {transactions.slice(0, 3).map((transaction) => (
                  <View key={transaction._id} style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Text style={styles.transactionIconText}>
                        {transaction.type === "deposit"
                          ? "📥"
                          : transaction.type === "payment"
                          ? "💳"
                          : transaction.type === "vip_purchase"
                          ? "👑"
                          : "💰"}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionTitle}>
                        {transaction.description ||
                          (transaction.type === "deposit"
                            ? "Nạp tiền"
                            : transaction.type === "payment"
                            ? "Thanh toán"
                            : transaction.type === "vip_purchase"
                            ? "Mua VIP"
                            : "Giao dịch")}
                      </Text>
                      <Text style={styles.transactionTime}>
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </View>
                    <Text
                      style={[
                        transaction.type === "deposit"
                          ? styles.transactionAmount
                          : styles.transactionAmountNegative,
                      ]}
                    >
                      {transaction.type === "deposit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleHistory}
                >
                  <Text style={styles.viewAllText}>Xem tất cả giao dịch</Text>
                  <Text style={styles.viewAllArrow}>→</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyTransactionContainer}>
                <Text style={styles.emptyTransactionText}>
                  Chưa có giao dịch nào
                </Text>
                <Text style={styles.emptyTransactionSubtext}>
                  Các giao dịch của bạn sẽ hiển thị ở đây
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Wallet Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin ví</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số ví</Text>
              <Text style={styles.infoValue}>
                PLN-{user?._id?.slice(-8) || "12345678"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chủ sở hữu</Text>
              <Text style={styles.infoValue}>
                {user?.fullName || "Chưa cập nhật"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <Text style={[styles.infoValue, styles.statusActive]}>
                Hoạt động
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày tạo</Text>
              <Text style={styles.infoValue}>01/01/2024</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDepositCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp tiền vào ví</Text>
              <TouchableOpacity
                onPress={handleDepositCancel}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Số tiền muốn nạp (VND)</Text>
              <TextInput
                style={styles.modalInput}
                value={depositAmount}
                onChangeText={formatAmountInput}
                placeholder="Nhập số tiền..."
                keyboardType="numeric"
                autoFocus={true}
              />

              <View style={styles.quickAmountContainer}>
                <Text style={styles.quickAmountLabel}>Số tiền nhanh:</Text>
                <View style={styles.quickAmountButtons}>
                  <TouchableOpacity
                    style={styles.quickAmountButton}
                    onPress={() => setDepositAmount("50,000")}
                  >
                    <Text style={styles.quickAmountText}>50K</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAmountButton}
                    onPress={() => setDepositAmount("100,000")}
                  >
                    <Text style={styles.quickAmountText}>100K</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAmountButton}
                    onPress={() => setDepositAmount("500,000")}
                  >
                    <Text style={styles.quickAmountText}>500K</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAmountButton}
                    onPress={() => setDepositAmount("1,000,000")}
                  >
                    <Text style={styles.quickAmountText}>1M</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleDepositCancel}
                disabled={isProcessing}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  isProcessing && styles.modalConfirmButtonDisabled,
                ]}
                onPress={handleDepositConfirm}
                disabled={isProcessing || !depositAmount}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 60,
  },
  balanceCard: {
    margin: 20,
    backgroundColor: "#2196F3",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  eyeIcon: {
    fontSize: 20,
  },
  balanceAmount: {
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  balanceFooter: {
    marginTop: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  transactionsCard: {
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
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  transactionAmountNegative: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F44336",
  },
  viewAllButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "600",
  },
  viewAllArrow: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "bold",
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
  statusActive: {
    color: "#4CAF50",
  },
  bottomSpacing: {
    height: 20,
  },
  transactionLoadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  transactionLoadingText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  emptyTransactionContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTransactionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyTransactionSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    minHeight: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  modalContent: {
    padding: 24,
    flex: 1,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    backgroundColor: "#F9F9F9",
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "600",
  },
  quickAmountContainer: {
    marginBottom: 28,
  },
  quickAmountLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontWeight: "500",
  },
  quickAmountButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },
  modalNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  modalConfirmButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default WalletScreen;

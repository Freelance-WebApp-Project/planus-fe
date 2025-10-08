import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { showToast } from '../../utils/toast.utils';

const { width, height } = Dimensions.get('window');

interface PremiumPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  isLoading?: boolean;
}

const PremiumPopup: React.FC<PremiumPopupProps> = ({ visible, onClose, onSubscribe, isLoading = false }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    try {
      await onSubscribe(selectedPlan);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Hàng tháng',
      price: '50.000',
      period: 'VND/Tháng',
      originalPrice: null,
      discount: null,
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Hàng năm',
      price: '399.000',
      period: 'VND/Năm',
      originalPrice: '500.000',
      discount: '20%',
      popular: true,
    },
  ];

  const benefits = [
    {
      icon: 'unlock',
      title: 'Mở khoá tất cả plan trên 3 địa điểm',
      description: 'Truy cập không giới hạn các kế hoạch du lịch',
    },
    {
      icon: 'edit',
      title: 'Tạo và chia sẻ plan không giới hạn',
      description: 'Tạo bao nhiêu kế hoạch tùy thích và chia sẻ với bạn bè',
    },
    {
      icon: 'ticket',
      title: 'Voucher ưu đãi hàng tháng',
      description: 'Nhận voucher giảm giá độc quyền mỗi tháng',
    },
    {
      icon: 'headphones',
      title: 'Hỗ trợ ưu tiên 24/7',
      description: 'Được hỗ trợ khách hàng ưu tiên mọi lúc',
    },
    {
      icon: 'bar-chart',
      title: 'Báo cáo chi tiết',
      description: 'Theo dõi chi tiêu và thống kê du lịch',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesome name="star" size={24} color="#FFD700" style={styles.crownIcon} />
              <Text style={styles.headerTitle}>Premium</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Quyền lợi Premium</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <FontAwesome name={benefit.icon as any} size={20} color="#4facfe" style={styles.benefitIcon} />
                  <View style={styles.benefitContent}>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                    <Text style={styles.benefitDescription}>{benefit.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Pricing Plans */}
            <View style={styles.pricingSection}>
              <Text style={styles.sectionTitle}>Chọn gói đăng ký</Text>
              <View style={styles.plansContainer}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && styles.planCardSelected,
                      plan.popular && styles.popularPlan,
                    ]}
                    onPress={() => setSelectedPlan(plan.id as 'monthly' | 'yearly')}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Phổ biến</Text>
                      </View>
                    )}
                    
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.planPrice}>
                        <Text style={styles.priceValue}>{plan.price}</Text>
                        <Text style={styles.pricePeriod}>{plan.period}</Text>
                      </View>
                    </View>

                    {plan.originalPrice && (
                      <View style={styles.planDiscount}>
                        <Text style={styles.originalPrice}>{plan.originalPrice} VND</Text>
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{plan.discount}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.planFeatures}>
                      <Text style={styles.featureText}>✓ Tất cả quyền lợi Premium</Text>
                      <Text style={styles.featureText}>
                        ✓ {plan.id === 'yearly' ? 'Tiết kiệm 25%' : 'Thanh toán linh hoạt'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsSection}>
              <Text style={styles.termsText}>
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text> của chúng tôi.
              </Text>
            </View>
          </ScrollView>

          {/* Subscribe Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.subscribeButtonText}>Đang xử lý...</Text>
                </View>
              ) : (
                <Text style={styles.subscribeButtonText}>Đăng ký ngay!</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  pricingSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#4facfe',
    backgroundColor: '#F8F9FF',
  },
  popularPlan: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#666',
  },
  planDiscount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planFeatures: {
    gap: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  termsSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: '#4facfe',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subscribeButton: {
    backgroundColor: '#4facfe',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4facfe',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PremiumPopup;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { showToast } from '../../utils/toast.utils';

const { width, height } = Dimensions.get('window');

interface PremiumPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
}

const PremiumPopup: React.FC<PremiumPopupProps> = ({ visible, onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubscribe(selectedPlan);
      showToast.success('Thành công', 'Đăng ký Premium thành công!');
      onClose();
    } catch (error) {
      showToast.error('Lỗi', 'Có lỗi xảy ra khi đăng ký Premium');
    } finally {
      setIsSubscribing(false);
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Hàng tháng',
      price: '39.000',
      period: 'VND/Tháng',
      originalPrice: null,
      discount: null,
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Hàng năm',
      price: '350.000',
      period: 'VND/Năm',
      originalPrice: '468.000',
      discount: '25%',
      popular: true,
    },
  ];

  const benefits = [
    {
      icon: '⭐',
      title: 'Mở khoá tất cả plan trên 3 địa điểm',
      description: 'Truy cập không giới hạn các kế hoạch du lịch',
    },
    {
      icon: '📝',
      title: 'Tạo và chia sẻ plan không giới hạn',
      description: 'Tạo bao nhiêu kế hoạch tùy thích và chia sẻ với bạn bè',
    },
    {
      icon: '🎫',
      title: 'Voucher ưu đãi hàng tháng',
      description: 'Nhận voucher giảm giá độc quyền mỗi tháng',
    },
    {
      icon: '🎯',
      title: 'Hỗ trợ ưu tiên 24/7',
      description: 'Được hỗ trợ khách hàng ưu tiên mọi lúc',
    },
    {
      icon: '📊',
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
              <Text style={styles.crownIcon}>👑</Text>
              <Text style={styles.headerTitle}>Premium</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Quyền lợi Premium</Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
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
              style={[styles.subscribeButton, isSubscribing && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={isSubscribing}
            >
              <Text style={styles.subscribeButtonText}>
                {isSubscribing ? 'Đang xử lý...' : 'Đăng ký ngay!'}
              </Text>
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
    fontSize: 24,
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
    fontSize: 20,
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
    borderColor: '#2196F3',
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
    color: '#2196F3',
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
    color: '#2196F3',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subscribeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
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
});

export default PremiumPopup;

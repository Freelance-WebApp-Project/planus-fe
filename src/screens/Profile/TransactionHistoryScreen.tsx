import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useWallet } from '../../hooks/useWallet';
import { WalletTransaction } from '../../types/wallet.types';

const { width } = Dimensions.get('window');

const TransactionHistoryScreen = ({ navigation }: any) => {
  const {
    transactions,
    loading,
    error,
    refresh,
  } = useWallet();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number, source?: string) => {
    const formattedAmount = amount.toLocaleString('vi-VN');
    if (source === 'point') {
      return formattedAmount + ' điểm';
    }
    return formattedAmount + ' VND';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return { name: 'arrow-down' as const, color: '#4CAF50' };
      case 'withdraw':
        return { name: 'arrow-up' as const, color: '#FF5722' };
      case 'payment':
        return { name: 'credit-card' as const, color: '#FF5722' };
      case 'bonus':
        return { name: 'gift' as const, color: '#FFD700' };
      case 'vip_purchase':
        return { name: 'star' as const, color: '#FFD700' };
      default:
        return { name: 'money' as const, color: '#4facfe' };
    }
  };

  const getTransactionTitle = (transaction: WalletTransaction) => {
    if (transaction.description) {
      return transaction.description;
    }
    
    switch (transaction.type) {
      case 'deposit':
        return 'Nạp tiền vào ví';
      case 'withdraw':
        return 'Rút tiền từ ví';
      case 'payment':
        return 'Thanh toán';
      case 'bonus':
        return 'Thưởng';
      case 'vip_purchase':
        return 'Mua gói VIP';
      default:
        return 'Giao dịch';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'bonus':
        return '#4CAF50'; // Green for income
      case 'withdraw':
      case 'payment':
      case 'vip_purchase':
        return '#F44336'; // Red for expenses
      default:
        return '#333';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'bonus':
        return '+';
      case 'withdraw':
      case 'payment':
      case 'vip_purchase':
        return '-';
      default:
        return '';
    }
  };

  const renderTransaction = ({ item }: { item: WalletTransaction }) => {
    const iconData = getTransactionIcon(item.type);
    const showAmount = item.amount > 0 || item.type === 'bonus'; // Show amount for bonus even if 0
    
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <FontAwesome 
            name={iconData.name} 
            size={20} 
            color={iconData.color} 
          />
        </View>
      
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {getTransactionTitle(item)}
          </Text>
          <Text style={styles.transactionTime}>
            {formatDate(item.createdAt)}
          </Text>
          {item.source && (
            <Text style={styles.transactionSource}>
              Nguồn: {item.source === 'balance' ? 'Ví' : item.source === 'point' ? 'Điểm' : item.source}
            </Text>
          )}
        </View>
        
        <View style={styles.transactionAmountContainer}>
          {showAmount ? (
            <Text style={[
              styles.transactionAmount,
              { color: getAmountColor(item.type) }
            ]}>
              {getAmountPrefix(item.type)}{formatCurrency(item.amount, item.source)}
            </Text>
          ) : (
            <Text style={[
              styles.transactionAmount,
              { color: '#666' }
            ]}>
              Miễn phí
            </Text>
          )}
          <Text style={styles.transactionType}>
            {item.type.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome 
        name="list-alt" 
        size={80} 
        color="#4facfe" 
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
      <Text style={styles.emptyDescription}>
        Các giao dịch của bạn sẽ hiển thị ở đây
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <FontAwesome 
          name="arrow-left" 
          size={18} 
          color="#4facfe" 
        />
        <Text style={styles.backButtonText}> Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4facfe" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tổng quan</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng giao dịch:</Text>
            <Text style={styles.summaryValue}>{transactions.length}</Text>
          </View>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4facfe']}
              tintColor="#4facfe"
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={transactions.length === 0 ? styles.emptyListContainer : styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4facfe',
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#4facfe',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  transactionTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionSource: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  transactionId: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TransactionHistoryScreen;

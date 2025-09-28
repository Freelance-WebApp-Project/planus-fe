import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../hoc/AuthContext';
import { showToast } from '../../utils/toast.utils';
import { userService } from '../../services/user.service';

const { width, height } = Dimensions.get('window');

const IncomeSetupScreen = ({ navigation, route }: any) => {
  const { profileData } = route.params || {};
  const { user, setUser } = useAuth();
  const [income, setIncome] = useState(5000000);
  const [customIncome, setCustomIncome] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedIncomes = [
    { label: '5.000.000 VND', value: 5000000 },
    { label: '7.000.000 VND', value: 7000000 },
    { label: '10.000.000 VND', value: 10000000 },
    { label: '15.000.000 VND', value: 15000000 },
  ];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const handlePredefinedIncome = (value: number) => {
    setIncome(value);
    setCustomIncome('');
  };

  const handleCustomIncome = (text: string) => {
    setCustomIncome(text);
    const numericValue = parseInt(text.replace(/[^0-9]/g, ''));
    if (!isNaN(numericValue)) {
      setIncome(numericValue);
    }
  };

  const handleNext = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Prepare profile data for API
      const updateProfileData = {
        fullName: profileData?.fullName || user?.fullName || '',
        email: user?.email || '',
        gender: profileData?.gender || '',
        dob: profileData?.dob || '',
        income: income,
        favorites: profileData?.interests || []
      };

      // Call API to update profile
      const response = await userService.updateProfile(updateProfileData);
      
      if (response.success) {
        // Mark setup as complete and first login as false
        const updatedUser = {
          ...user!,
          isSetupComplete: true,
          isFirstLogin: false,
          fullName: updateProfileData.fullName,
          gender: updateProfileData.gender,
          income: updateProfileData.income,
          favorites: updateProfileData.favorites
        };
        
        setUser(updatedUser);
        showToast.success('Thành công', 'Thiết lập hồ sơ hoàn tất!');
        
        // AppNavigator will automatically navigate to Main based on updated user state
        // No need to manually navigate
      } else {
        const errorMessage = response.error?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ';
        showToast.error('Lỗi', errorMessage);
      }
    } catch (error) {
      showToast.error('Lỗi', 'Có lỗi xảy ra khi hoàn tất thiết lập');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PLANUS</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Income Section */}
        <View style={styles.incomeCard}>
          <Text style={styles.incomeTitle}>Thu nhập</Text>
          
          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1000000}
              maximumValue={50000000}
              value={income}
              onValueChange={setIncome}
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#E0E0E0"
            />
            <Text style={styles.sliderValue}>{formatCurrency(income)}</Text>
          </View>

          {/* Predefined Options */}
          <View style={styles.predefinedContainer}>
            {predefinedIncomes.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.predefinedButton,
                  income === item.value && styles.predefinedButtonSelected
                ]}
                onPress={() => handlePredefinedIncome(item.value)}
              >
                <Text style={[
                  styles.predefinedText,
                  income === item.value && styles.predefinedTextSelected
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Input */}
          <View style={styles.customInputContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.customInputWrapper}>
            <TextInput
              style={styles.customInput}
              placeholder="Điền thu nhập của bạn tại đây"
              value={customIncome}
              onChangeText={handleCustomIncome}
              keyboardType="numeric"
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>

        {/* Image Cards */}
        <View style={styles.imageCardsContainer}>
          <View style={styles.imageCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop' }}
              style={styles.imageCardImage}
            />
          </View>
          <View style={styles.imageCard}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop' }}
              style={styles.imageCardImage}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, isLoading && styles.nextButtonDisabled]} 
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>Hoàn tất ✓</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  incomeCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    textAlign: 'center',
    marginTop: 10,
  },
  predefinedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  predefinedButton: {
    width: (width - 100) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minHeight: 56,
  },
  predefinedButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  predefinedText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  predefinedTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#BDBDBD',
  },
  orText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#9E9E9E',
  },
  customInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 56,
  },
  customInput: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000000',
  },
  imageCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageCardImage: {
    width: '100%',
    height: '100%',
  },
  bottomNav: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#E3F2FD',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    flex: 0.45,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    flex: 0.45,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nextButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
});

export default IncomeSetupScreen;

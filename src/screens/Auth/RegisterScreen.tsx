  import React, { useState } from 'react';
  import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Dimensions,
  } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../hoc/AuthContext';
import { RegisterRequest } from '../../types/auth.types';
import { showToast, formatErrorMessage } from '../../utils/toast.utils';

  const { width, height } = Dimensions.get('window');

  const RegisterScreen = ({ navigation }: any) => {
    const { register, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      showToast.error('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      showToast.error('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeToTerms) {
      showToast.error('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

      const userData: RegisterRequest = {
        email,
        username,
        password,
        confirmPassword,
      };

      try {
        const response = await register(userData);
        
        if (response.success) {
          showToast.success('Thành công', 'Tài khoản đã được tạo thành công! Vui lòng đăng nhập.');
          // Navigate to login after a short delay
          setTimeout(() => {
            navigation.navigate('Login');
          }, 2000);
        } else {
          const error = response.error;
          if (error) {
            const errorMessage = formatErrorMessage(error, 'Đăng ký thất bại');
            showToast.error('Lỗi đăng ký', errorMessage);
          } else {
            showToast.error('Lỗi', 'Đăng ký thất bại');
          }
        }
      } catch (error) {
        showToast.error('Lỗi', 'Có lỗi xảy ra khi đăng ký');
      }
    };

    const navigateToLogin = () => {
      navigation.navigate('Login');
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Background Gradient */}
        <View style={styles.backgroundGradient} />
        
        {/* Decorative Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with logo */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                {/* Modern logo design */}
                <View style={styles.logoWrapper}>
                  <View style={styles.logoIcon}>
                    <Text style={styles.logoText}>✈️</Text>
                  </View>
                  <View style={styles.logoAccent} />
                </View>
                
                <Text style={styles.title}>PLANUS</Text>
                <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
              </View>
            </View>

            {/* Registration form */}
            <View style={styles.formContainer}>
              <View style={styles.formCard}>
                
                {/* Email input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Địa chỉ email</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Text style={styles.iconText}>📧</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập địa chỉ email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                </View>

                {/* Username input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Tên người dùng</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Text style={styles.iconText}>👤</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập tên người dùng"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      placeholderTextColor="#A0A0A0"
                    />
                  </View>
                </View>

                {/* Password input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Text style={styles.iconText}>🔒</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!isPasswordVisible}
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      <Text style={styles.iconText}>
                        {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Text style={styles.iconText}>🔒</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!isConfirmPasswordVisible}
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    >
                      <Text style={styles.iconText}>
                        {isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and conditions */}
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                  >
                    <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                      {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.termsText}>
                      Tôi đồng ý với{' '}
                      <Text style={styles.linkText}>Điều khoản sử dụng</Text>
                      {' '}và{' '}
                      <Text style={styles.linkText}>Chính sách bảo mật</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Register button */}
                <TouchableOpacity 
                  style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Login button */}
                <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
                  <Text style={styles.loginButtonText}>Đã có tài khoản? Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a2e',
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#16213e',
    },
    circle1: {
      position: 'absolute',
      width: width * 0.8,
      height: width * 0.8,
      borderRadius: width * 0.4,
      backgroundColor: 'rgba(135, 206, 235, 0.1)',
      top: -width * 0.3,
      right: -width * 0.2,
    },
    circle2: {
      position: 'absolute',
      width: width * 0.6,
      height: width * 0.6,
      borderRadius: width * 0.3,
      backgroundColor: 'rgba(135, 206, 235, 0.05)',
      bottom: -width * 0.2,
      left: -width * 0.1,
    },
    circle3: {
      position: 'absolute',
      width: width * 0.4,
      height: width * 0.4,
      borderRadius: width * 0.2,
      backgroundColor: 'rgba(135, 206, 235, 0.08)',
      top: height * 0.3,
      right: -width * 0.1,
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 30,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logoWrapper: {
      position: 'relative',
      marginBottom: 20,
    },
    logoIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(135, 206, 235, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(135, 206, 235, 0.3)',
    },
    logoText: {
      fontSize: 32,
    },
    logoAccent: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#87CEEB',
    },
    title: {
      fontSize: 42,
      fontWeight: 'bold',
      color: '#FFF',
      letterSpacing: 3,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
    },
    formContainer: {
      flex: 1,
    },
    formCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1a1a2e',
      textAlign: 'center',
      marginBottom: 30,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a1a2e',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: '#E9ECEF',
    },
    inputIcon: {
      marginRight: 12,
    },
    iconText: {
      fontSize: 18,
      color: '#87CEEB',
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: '#1a1a2e',
    },
    eyeIcon: {
      padding: 4,
    },
    termsContainer: {
      marginBottom: 25,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#87CEEB',
      marginRight: 12,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#87CEEB',
    },
    checkmark: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    termsText: {
      fontSize: 14,
      color: '#6c757d',
      lineHeight: 20,
      flex: 1,
    },
    linkText: {
      color: '#87CEEB',
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: '#87CEEB',
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#87CEEB',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    registerButtonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    registerButtonDisabled: {
      opacity: 0.7,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E9ECEF',
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: '#6c757d',
    },
    loginButton: {
      backgroundColor: 'transparent',
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#87CEEB',
    },
    loginButtonText: {
      color: '#87CEEB',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  export default RegisterScreen;
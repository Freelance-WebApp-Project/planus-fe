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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleRegister = () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    // Handle registration logic here
    console.log('Register:', { email, username, password });
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header with logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* World map illustration */}
            <View style={styles.worldMap}>
              <View style={styles.mapBackground} />
              {/* Airplane icon */}
              <View style={styles.airplane}>
                <Text style={styles.airplaneIcon}>✈️</Text>
              </View>
              {/* Flight path */}
              <View style={styles.flightPath} />
            </View>
            
            {/* App title */}
            <Text style={styles.title}>PLANUS</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới</Text>
          </View>
        </View>

        {/* Registration form */}
        <View style={styles.formContainer}>
          {/* Email input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ E-mail</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>📧</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập địa chỉ email tại đây..."
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
                placeholder="Nhập tên người dùng tại đây..."
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>

          {/* Password input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật Khẩu</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu tại đây"
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
            <Text style={styles.inputLabel}>Xác nhận Mật Khẩu</Text>
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
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login button */}
          <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
            <Text style={styles.loginButtonText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4FF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  worldMap: {
    width: 150,
    height: 90,
    marginBottom: 15,
    position: 'relative',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#87CEEB',
    borderRadius: 10,
    opacity: 0.3,
  },
  airplane: {
    position: 'absolute',
    top: 20,
    left: 30,
  },
  airplaneIcon: {
    fontSize: 20,
    transform: [{ rotate: '45deg' }],
  },
  flightPath: {
    position: 'absolute',
    top: 35,
    left: 45,
    width: 70,
    height: 2,
    backgroundColor: '#333',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    color: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  linkText: {
    color: '#87CEEB',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#87CEEB',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#87CEEB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#87CEEB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: {
    color: '#87CEEB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../hoc/AuthContext';

const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    // Simulate login success
    console.log('Login:', { email, password, rememberMe });
    login(); // This will navigate to the main app
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
    console.log('Forgot password');
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header with logo and world map */}
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
          </View>
        </View>

        {/* Login form */}
        <View style={styles.formContainer}>
          {/* Email input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Địa chỉ E-mail/Tên người dùng</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nhập email hoặc tên người dùng tại đây..."
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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

          {/* Remember me and forgot password */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Nhớ tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register button */}
          <TouchableOpacity style={styles.registerButton} onPress={navigateToRegister}>
            <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
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
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  worldMap: {
    width: 200,
    height: 120,
    marginBottom: 20,
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
    top: 30,
    left: 40,
  },
  airplaneIcon: {
    fontSize: 24,
    transform: [{ rotate: '45deg' }],
  },
  flightPath: {
    position: 'absolute',
    top: 50,
    left: 60,
    width: 100,
    height: 2,
    backgroundColor: '#333',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  formContainer: {
    flex: 1,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#87CEEB',
    marginRight: 8,
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
  rememberMeText: {
    fontSize: 14,
    color: '#666',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#87CEEB',
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
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
  registerButton: {
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
  registerButtonText: {
    color: '#87CEEB',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
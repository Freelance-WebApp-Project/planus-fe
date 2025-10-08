import React, { useState } from "react";
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
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../hoc/AuthContext";
import { LoginRequest, AuthError } from "../../types/auth.types";
import { showToast, formatErrorMessage } from "../../utils/toast.utils";
import { FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }: any) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast.error("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const credentials: LoginRequest = {
      username: email,
      password,
    };

    try {
      const response = await login(credentials);

      if (response.success) {
        showToast.success("Thành công", "Đăng nhập thành công");

        // AppNavigator will automatically handle navigation based on user state
        // No need to manually navigate from LoginScreen
      } else {
        const error = response.error;
        if (error) {
          const errorMessage = formatErrorMessage(error, "Đăng nhập thất bại");
          showToast.error("Lỗi đăng nhập", errorMessage);
        } else {
          showToast.error("Lỗi", "Đăng nhập thất bại");
        }
      }
    } catch (error) {
      showToast.error("Lỗi", "Có lỗi xảy ra khi đăng nhập");
      return;
    }
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative Circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      <View style={styles.circle3} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with logo */}
          <View style={styles.header}>
            <Image
              source={require("../../../assets/logo.png")}
              style={{
                width: 80,
                height: 80,
                marginBottom: 20,
                borderRadius: 40,
              }}
            />
            <Text style={styles.title}>PLANUS</Text>
            <Text style={styles.subtitle}>
              Khám phá thế giới cùng chúng tôi
            </Text>
          </View>

          {/* Login form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              {/* Email input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email hoặc tên người dùng</Text>
                <View style={styles.inputWrapper}>
                  {/* <View style={styles.inputIcon}>
                    <Text style={styles.iconText}>👤</Text>
                  </View> */}
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập email hoặc tên người dùng"
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
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  {/* <View style={styles.inputIcon}>
                    <Text style={styles.iconText}>🔒</Text>
                  </View> */}
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
                    {isPasswordVisible ? (
                      <FontAwesome name="eye" size={18} color="black" />
                    ) : (
                      <FontAwesome name="eye-slash" size={18} color="black" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember me and forgot password */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberMeText}>Nhớ tôi</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
              >
                <TouchableOpacity
                  style={styles.loginButtonTouchable}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Register button */}
              <TouchableOpacity
                style={styles.registerButton}
                onPress={navigateToRegister}
              >
                <Text style={styles.registerButtonText}>Tạo tài khoản mới</Text>
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
    backgroundColor: "#4facfe",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(135, 206, 235, 0.1)",
    top: -width * 0.3,
    right: -width * 0.2,
  },
  circle2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(135, 206, 235, 0.05)",
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  circle3: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "rgba(135, 206, 235, 0.08)",
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
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  logoText: {
    fontSize: 32,
  },
  logoAccent: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#87CEEB",
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inputIcon: {
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    color: "#87CEEB",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a2e",
  },
  eyeIcon: {
    padding: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000000",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#87CEEB",
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#000000",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonTouchable: {
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E9ECEF",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6c757d",
  },
  registerButton: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#87CEEB",
  },
  registerButtonText: {
    color: "#87CEEB",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;

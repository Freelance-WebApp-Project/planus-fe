import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../hoc/AuthContext";
import AuthNavigator from "./AuthNavigator";
import SetupNavigator from "./SetupNavigator";
import BottomTabNavigator from "./BottomTabNavigator";
import { StyleSheet } from "react-native";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Check if user is first login or hasn't completed setup
          user?.isFirstLogin ? (
            <Stack.Screen name="Setup" component={SetupNavigator} />
          ) : (
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F4FF",
  },
});
export default AppNavigator;

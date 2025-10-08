import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import HomeScreen from "../screens/TabsScreen/HomeScreen";
import FavoritesScreen from "../screens/TabsScreen/FavoritesScreen";
import SearchScreen from "../screens/TabsScreen/SearchScreen";
import ProfileScreen from "../screens/TabsScreen/ProfileScreen";
import WalletScreen from "../screens/Profile/WalletScreen";
import TransactionHistoryScreen from "../screens/Profile/TransactionHistoryScreen";
import TripPlanningInputScreen from "../screens/TripPlanning/TripPlanningInputScreen";
import SelectDestinationScreen from "../screens/TripPlanning/SelectDestinationScreen";
import SuggestedPlansScreen from "../screens/TripPlanning/SuggestedPlansScreen";
import PlanDetailsScreen from "../screens/TripPlanning/PlanDetailsScreen";
import TravelHistoryScreen from "../screens/Profile/TravelHistoryScreen";
import PlanDetailHistoryScreen from "../screens/Profile/PlanDetailHistoryScreen";
import { FontAwesome } from "@expo/vector-icons";
import SelectScheduleScreen from "../screens/TripPlanning/SelectScheduleScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen
        name="PlanDetailHistory"
        component={PlanDetailHistoryScreen}
      />
    </Stack.Navigator>
  );
};

// Main Stack Navigator
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="TripPlanning" component={TripPlanningInputScreen} />
      <Stack.Screen
        name="SelectDestination"
        component={SelectDestinationScreen}
      />
      <Stack.Screen
        name="SelectScheduleScreen"
        component={SelectScheduleScreen}
      />
      <Stack.Screen name="SuggestedPlans" component={SuggestedPlansScreen} />
      <Stack.Screen name="PlanDetails" component={PlanDetailsScreen} />
      <Stack.Screen name="TravelHistory" component={TravelHistoryScreen} />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
      />
    </Stack.Navigator>
  );
};

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const HomeIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: "center" }}>
    {/* <Text style={{ fontSize: 22, color: focused ? "#5A9FD8" : "#999" }}>
      🏠
    </Text> */}
    {/* <FontAwesome name="home" size={22} color="#000000" /> */}
    <FontAwesome
      name="home" 
      size={22}
      color={focused ? "#000000" : "#999"} // màu đỏ khi chọn
    />
  </View>
);

const FavoritesIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: "center" }}>
    {/* <Text style={{ fontSize: 22, color: focused ? "#5A9FD8" : "#999" }}>
      ❤️
    </Text> */}
    {/* <FontAwesome name="heart-o" size={22} color="#000000" /> */}
    <FontAwesome
      name={focused ? "heart" : "heart-o"} // ❤️ khi active, 🤍 khi inactive
      size={22}
      color={focused ? "#000000" : "#999"}
    />
  </View>
);

const AddIcon = ({ focused, color }: TabIconProps) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#5A9FD8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
      }}
      onPress={() => navigation.navigate("TripPlanning" as never)}
    >
      <Text style={{ fontSize: 26, color: "#FFF", fontWeight: "bold" }}>+</Text>
    </TouchableOpacity>
  );
};

const SearchIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: "center" }}>
    {/* <Text style={{ fontSize: 22, color: focused ? "#5A9FD8" : "#999" }}>
      🔍
    </Text> */}
    {/* <FontAwesome name="search" size={22} color="#000000" /> */}
    <FontAwesome
      name="search" 
      size={22}
      color={focused ? "#000000" : "#999"} // màu đỏ khi chọn
    />
  </View>
);

const ProfileIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: "center" }}>
    {/* <Text style={{ fontSize: 22, color: focused ? "#5A9FD8" : "#999" }}>
      👤
    </Text> */}
    {/* <FontAwesome name="user" size={22} color="#000000" /> */}
    <FontAwesome
      name="user" 
      size={22}
      color={focused ? "#000000" : "#999"} // màu đỏ khi chọn
    />
  </View>
);

// Placeholder screen for Add functionality
const AddScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5F5F5",
    }}
  >
    <Text style={{ fontSize: 64, marginBottom: 20 }}>➕</Text>
    <Text
      style={{
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
      }}
    >
      Thêm mới
    </Text>
    <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
      Thêm địa điểm hoặc trải nghiệm mới
    </Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#5A9FD8",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          tabBarLabel: "Trang chủ",
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: FavoritesIcon,
          tabBarLabel: "Yêu thích",
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarIcon: AddIcon,
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: SearchIcon,
          tabBarLabel: "Tìm kiếm",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ProfileIcon,
          tabBarLabel: "Hồ sơ",
        }}
      />
    </Tab.Navigator>
  );
};

export default MainStack;

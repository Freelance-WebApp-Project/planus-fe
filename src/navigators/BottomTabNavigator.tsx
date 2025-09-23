import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import HomeScreen from '../screens/TabsScreen/HomeScreen';
import FavoritesScreen from '../screens/TabsScreen/FavoritesScreen';
import SearchScreen from '../screens/TabsScreen/SearchScreen';
import ProfileScreen from '../screens/TabsScreen/ProfileScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

const HomeIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 22, color: focused ? '#5A9FD8' : '#999' }}>🏠</Text>
  </View>
);

const FavoritesIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 22, color: focused ? '#5A9FD8' : '#999' }}>❤️</Text>
  </View>
);

const AddIcon = ({ focused, color }: TabIconProps) => (
  <View style={{
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5A9FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }}>
    <Text style={{ fontSize: 26, color: '#FFF', fontWeight: 'bold' }}>+</Text>
  </View>
);

const SearchIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 22, color: focused ? '#5A9FD8' : '#999' }}>🔍</Text>
  </View>
);

const ProfileIcon = ({ focused, color }: TabIconProps) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 22, color: focused ? '#5A9FD8' : '#999' }}>👤</Text>
  </View>
);

// Placeholder screen for Add functionality
const AddScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
    <Text style={{ fontSize: 64, marginBottom: 20 }}>➕</Text>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>Thêm mới</Text>
    <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>Thêm địa điểm hoặc trải nghiệm mới</Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
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
        tabBarActiveTintColor: '#5A9FD8',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: FavoritesIcon,
          tabBarLabel: 'Yêu thích',
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarIcon: AddIcon,
          tabBarLabel: '',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: SearchIcon,
          tabBarLabel: 'Tìm kiếm',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileIcon,
          tabBarLabel: 'Hồ sơ',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface CategoryItem {
  id: string;
  title: string;
  icon: string;
}

interface DestinationItem {
  id: string;
  title: string;
  image: string;
}

interface SuggestionItem {
  id: string;
  title: string;
  image: string;
}

const HomeScreen = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState('');

  // Categories data
  const categories: CategoryItem[] = [
    { id: '1', title: 'Khu nghỉ dưỡng', icon: '🏖️' },
    { id: '2', title: 'Homestay', icon: '🏠' },
    { id: '3', title: 'Khách sạn', icon: '🏨' },
    { id: '4', title: 'Nhà nghỉ', icon: '🏢' },
    { id: '5', title: 'Villa', icon: '🏰' },
    { id: '6', title: 'Căn hộ', icon: '🏬' },
    { id: '7', title: 'Ký túc', icon: '🏫' },
    { id: '8', title: 'Xem thêm', icon: '⋯' },
  ];

  // Popular destinations
  const destinations: DestinationItem[] = [
    { id: '1', title: 'Ocean Park', image: 'https://via.placeholder.com/200x150/87CEEB/FFFFFF?text=Ocean+Park' },
    { id: '2', title: 'Bảo tàng', image: 'https://via.placeholder.com/200x150/4169E1/FFFFFF?text=Museum' },
    { id: '3', title: 'Hồ Tây', image: 'https://via.placeholder.com/200x150/9370DB/FFFFFF?text=Ho+Tay' },
  ];

  // Suggestions
  const suggestions: SuggestionItem[] = [
    { id: '1', title: 'Đường núi', image: 'https://via.placeholder.com/300x150/228B22/FFFFFF?text=Mountain+Road' },
    { id: '2', title: 'Thành phố cổ', image: 'https://via.placeholder.com/300x150/DC143C/FFFFFF?text=Old+City' },
  ];

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderDestinationItem = ({ item }: { item: DestinationItem }) => (
    <TouchableOpacity style={styles.destinationItem}>
      <View style={styles.destinationImageContainer}>
        <View style={[styles.destinationImage, { backgroundColor: '#87CEEB' }]} />
      </View>
      <Text style={styles.destinationText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }: { item: SuggestionItem }) => (
    <TouchableOpacity style={styles.suggestionItem}>
      <View style={[styles.suggestionImage, { backgroundColor: '#4169E1' }]} />
      <Text style={styles.suggestionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* User avatar and greeting */}
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <View style={styles.avatarImage} />
            </View>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Chào mừng!</Text>
              <Text style={styles.appName}>PlanUS</Text>
            </View>
          </View>

          {/* Notification icon */}
          <TouchableOpacity style={styles.notificationIcon}>
            <Text style={styles.notificationIconText}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm ở đây..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thể loại</Text>
            <TouchableOpacity>
              <View style={styles.menuIcon}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
          />
        </View>

        {/* Popular Destinations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa điểm phổ biến</Text>
            <TouchableOpacity>
              <View style={styles.menuIcon}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={destinations}
            renderItem={renderDestinationItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsList}
          />
        </View>

        {/* Suggestions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý</Text>
          
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#87CEEB',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 25,
  },
  greetingSection: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  appName: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconText: {
    fontSize: 18,
    color: '#FFF',
  },
  searchContainer: {
    marginTop: 10,
  },
  searchBar: {
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
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    marginLeft: 10,
  },
  searchIcon: {
    fontSize: 18,
    color: '#87CEEB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 3,
    backgroundColor: '#87CEEB',
    borderRadius: 1.5,
  },
  categoriesGrid: {
    paddingBottom: 10,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5A9FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconText: {
    fontSize: 24,
    color: '#FFF',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  destinationsList: {
    paddingRight: 20,
  },
  destinationItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  destinationImageContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationImage: {
    width: 120,
    height: 100,
    borderRadius: 15,
  },
  destinationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  suggestionsList: {
    paddingRight: 20,
  },
  suggestionItem: {
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionImage: {
    width: 200,
    height: 120,
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  suggestionText: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
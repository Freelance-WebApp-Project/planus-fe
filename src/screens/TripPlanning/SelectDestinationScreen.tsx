import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface CityOption {
  id: string;
  name: string;
  thumbnail: string;
}

const SelectDestinationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedPurpose, selectedDuration, radius } = route.params as any;

  const [currentLocation, setCurrentLocation] = useState('Hồ Chí Minh');
  const [selectedDestination, setSelectedDestination] = useState<string>('hanoi');

  const cities: CityOption[] = [
    { 
      id: 'hochiminh', 
      name: 'Thành phố Hồ Chí Minh', 
      thumbnail: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 'hanoi', 
      name: 'Thành phố Hà Nội', 
      thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 'danang', 
      name: 'Thành phố Đà Nẵng', 
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    { 
      id: 'haiphong', 
      name: 'Thành phố Hải Phòng', 
      thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
  ];

  const handleNext = () => {
    // Navigate to suggested plans screen with all parameters
    (navigation as any).navigate('SuggestedPlans', {
      selectedPurpose,
      selectedDuration,
      radius,
      destination: selectedDestination,
      currentLocation,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Hà Nội, Việt Nam</Text>
            <Text style={styles.chevronIcon}>▼</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>Vị trí của bạn</Text>
          </View>
        </View>

        {/* Current Location Input */}
        <View style={styles.currentLocationInputContainer}>
          <TextInput
            style={styles.currentLocationInput}
            value={currentLocation}
            onChangeText={setCurrentLocation}
            placeholder="Hồ Chí Minh"
          />
          <TouchableOpacity style={styles.currentLocationArrowButton}>
            <Text style={styles.currentLocationArrowText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Choose Destination Section */}
        <Text style={styles.chooseDestinationTitle}>Chọn điểm đến</Text>
        <View style={styles.destinationList}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[
                styles.destinationCard,
                selectedDestination === city.id && styles.selectedDestinationCard,
              ]}
              onPress={() => setSelectedDestination(city.id)}
            >
              <Text style={styles.destinationPinIcon}>📍</Text>
              <Text style={styles.destinationName}>{city.name}</Text>
              <Image source={{ uri: city.thumbnail }} style={styles.destinationThumbnail} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>Thêm...</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.navIcon}>←</Text>
          <Text style={styles.navText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 6,
    color: '#5A9FD8',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chevronIcon: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  notificationButton: {
    padding: 8,
  },
  bellIcon: {
    fontSize: 20,
    color: '#5A9FD8',
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentLocationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  currentLocationArrowButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  currentLocationArrowText: {
    fontSize: 20,
    color: '#666',
  },
  chooseDestinationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 15,
  },
  destinationList: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  selectedDestinationCard: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  destinationPinIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#E74C3C',
  },
  destinationName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  destinationThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  moreButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  moreButtonText: {
    fontSize: 16,
    color: '#5A9FD8',
    fontWeight: '500',
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  navIcon: {
    fontSize: 20,
    color: '#5A9FD8',
    marginRight: 8,
  },
  navText: {
    fontSize: 16,
    color: '#5A9FD8',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#5A9FD8',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#5A9FD8',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SelectDestinationScreen;

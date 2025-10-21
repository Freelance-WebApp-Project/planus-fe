import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CategoryItem, PlaceType, Place } from "../../types/place.types";
import { placeService } from "../../services/place.service";
import { API_CONFIG } from "../../constants/api.constants";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface DestinationItem {
  id: string;
  title: string;
  image: string;
  location: {
    address: string;
  };
}

interface SuggestionItem {
  id: string;
  title: string;
  image: string;
  location: {
    address: string;
  };
}

const HomeScreen = ({ navigation }: any) => {
  const [searchText, setSearchText] = useState("");
  const [randomPlaces, setRandomPlaces] = useState<Place[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<FlatList>(null);

  // Slider data
  const sliderImages = [
    require("../../../assets/slider1.jpg"),
    require("../../../assets/slider2.jpg"),
    require("../../../assets/slider3.jpg"),
    require("../../../assets/slider4.jpg"),
  ];

  // Categories data
  const categories: CategoryItem[] = [
    { id: "1", title: "Khu nghỉ dưỡng", icon: "🏖️", type: PlaceType.RESORT },
    { id: "2", title: "Homestay", icon: "🏠", type: PlaceType.HOMESTAY },
    { id: "3", title: "Khách sạn", icon: "🏨", type: PlaceType.KHACH_SAN },
    { id: "4", title: "Nhà nghỉ", icon: "🏢", type: PlaceType.NHA_NGHI },
    { id: "5", title: "Villa", icon: "🏰", type: PlaceType.VILLA },
    { id: "6", title: "Căn hộ", icon: "🏬", type: PlaceType.CAN_HO },
    { id: "7", title: "Ký túc", icon: "🏫", type: PlaceType.KY_TUC },
    { id: "8", title: "Xem thêm", icon: "⋯" },
  ];

  // Fetch random places on component mount
  useEffect(() => {
    const fetchRandomPlaces = async () => {
      try {
        const places = await placeService.getRandom();
        console.log("Random places:", places[0]);
        setRandomPlaces(places);
      } catch (error) {
        console.error("Error fetching random places:", error);
      }
    };

    fetchRandomPlaces();
  }, []);

  // Auto-scroll slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to current slide
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollToIndex({
        index: currentSlide,
        animated: true,
      });
    }
  }, [currentSlide]);

  // Helper function to truncate title if too long
  const truncateTitle = (title: string, maxLength: number = 20) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  // Helper function to get simple FontAwesome icons with colors
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "1":
        return { name: "umbrella" as const, color: "#FF6B6B" }; // Resort - Red
      case "2":
        return { name: "home" as const, color: "#4ECDC4" }; // Homestay - Teal
      case "3":
        return { name: "building" as const, color: "#45B7D1" }; // Hotel - Blue
      case "4":
        return { name: "bed" as const, color: "#96CEB4" }; // Guesthouse - Green
      case "5":
        return { name: "home" as const, color: "#FFEAA7" }; // Villa - Yellow
      case "6":
        return { name: "building" as const, color: "#DDA0DD" }; // Apartment - Purple
      case "7":
        return { name: "graduation-cap" as const, color: "#98D8C8" }; // Dormitory - Mint
      case "8":
        return { name: "ellipsis-h" as const, color: "#F7DC6F" }; // More - Gold
      default:
        return { name: "circle" as const, color: "#4facfe" };
    }
  };
  // Convert random places to destinations format (3 items)
  const destinations: DestinationItem[] = randomPlaces
    .slice(0, 3)
    .map((place, index) => ({
      id: place._id,
      title: truncateTitle(place.name || 'Unknown Place'),
      image: place.images?.[0]?.imageUrl
        ? `${API_CONFIG.UPLOADS_URL}/${place.images[0].imageUrl}`
        : `https://via.placeholder.com/200x150/87CEEB/FFFFFF?text=${encodeURIComponent(
            place.name || 'Place'
          )}`,
      location: {
        address: place.location?.address || 'Unknown Address',
      },
    }));

  // Convert random places to suggestions format (3 items)
  const suggestions: SuggestionItem[] = randomPlaces
    .slice(3, 6)
    .map((place, index) => ({
      id: place._id,
      title: truncateTitle(place.name, 25),
      image: place.images?.[0]?.imageUrl
        ? `${API_CONFIG.UPLOADS_URL}/${place.images[0].imageUrl}`
        : `https://via.placeholder.com/300x150/228B22/FFFFFF?text=${encodeURIComponent(
            place.name
          )}`,
      location: {
        address: place.location.address,
      },
    }));

  const handleCategoryPress = (item: CategoryItem) => {
    if (item.id === "8") {
      // "Xem thêm" button - navigate to all categories or places list
      navigation.navigate("Search", {
        showAllCategories: true,
      });
    } else if (item.type) {
      // Specific category - navigate to places filtered by type
      navigation.navigate("Search", {
        filterType: item.type,
        categoryTitle: item.title,
      });
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate("Search", {
        searchQuery: searchText.trim(),
      });
    }
  };

  const handleSeeMoreCategories = () => {
    navigation.navigate("Search", {
      showAllCategories: true,
    });
  };

  const handleSeeMoreDestinations = () => {
    navigation.navigate("Search", {
      showPopularPlaces: true,
    });
  };

  const handleReview = (placeId: string, imageUrl: string, address: string, title?: string) => {
    (navigation as any).navigate("ReviewDetailScreen", {
      placeId,
      imageUrl,
      address,
      title
    });
  };

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => {
    const iconData = getCategoryIcon(item.id);
    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.categoryIcon}>
          <FontAwesome name={iconData.name} size={24} color={iconData.color} />
        </View>
        <Text style={styles.categoryText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const renderDestinationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.destinationItem}
      onPress={() =>
        handleReview(item?.id, destinations[0].image, item?.location?.address, item.title)
      }
    >
      <View style={styles.destinationImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.destinationImage}
          defaultSource={{
            uri: "https://via.placeholder.com/200x150/87CEEB/FFFFFF?text=Loading",
          }}
          onError={() =>
            console.log("Error loading destination image:", item.image)
          }
        />
      </View>
      <Text style={styles.destinationText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }: { item: SuggestionItem }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() =>
        handleReview(item?.id, destinations[0].image, item?.location?.address, item.title)
      }
    >
      <View style={styles.suggestionImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.suggestionImage}
          defaultSource={{
            uri: "https://via.placeholder.com/120x100/4169E1/FFFFFF?text=Loading",
          }}
          onError={() =>
            console.log("Error loading suggestion image:", item.image)
          }
        />
      </View>
      <Text style={styles.suggestionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSliderItem = ({ item }: { item: any }) => (
    <View style={styles.sliderItem}>
      <Image source={item} style={styles.sliderImage} resizeMode="cover" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* Logo and greeting */}
          <View style={styles.userSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/logo.jpg")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>Chào mừng!</Text>
              <Text style={styles.appName}>PlanUS</Text>
            </View>
          </View>
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
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <FontAwesome name="search" size={18} color="#4facfe" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thể loại</Text>
            <TouchableOpacity onPress={handleSeeMoreCategories}>
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

        {/* Slider Section */}
        <View style={styles.section}>
          <View style={styles.sliderContainer}>
            <FlatList
              ref={sliderRef}
              data={sliderImages}
              renderItem={renderSliderItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setCurrentSlide(slideIndex);
              }}
              keyExtractor={(item, index) => index.toString()}
            />
            
            {/* Slider Indicators */}
            <View style={styles.sliderIndicators}>
              {sliderImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentSlide === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        

        {/* Popular Destinations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa điểm phổ biến</Text>
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greetingSection: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  appName: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.8,
  },
  searchContainer: {
    marginTop: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
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
    color: "#333",
  },
  searchButton: {
    marginLeft: 10,
  },
  searchIcon: {
    fontSize: 18,
    color: "#4facfe",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 35,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  menuLine: {
    height: 3,
    backgroundColor: "#87CEEB",
    borderRadius: 1.5,
  },
  categoriesGrid: {
    paddingBottom: 10,
  },
  categoryItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 5,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  destinationsList: {
    paddingRight: 20,
  },
  destinationItem: {
    marginRight: 15,
    alignItems: "center",
  },
  destinationImageContainer: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  suggestionsList: {
    paddingRight: 20,
  },
  suggestionItem: {
    marginRight: 15,
    alignItems: "center",
  },
  suggestionImageContainer: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionImage: {
    width: 120,
    height: 100,
    borderRadius: 15,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  sliderContainer: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderItem: {
    width: width - 40,
    height: 200,
  },
  sliderImage: {
    width: "100%",
    height: "100%",
  },
  sliderIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D3D3D3",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#4facfe",
    width: 20,
  },
});

export default HomeScreen;

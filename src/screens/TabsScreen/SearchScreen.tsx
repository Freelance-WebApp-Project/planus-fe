import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { usePlaces } from "../../hooks/usePlace";
import { PlaceType, SearchScreenParams, Place } from "../../types/place.types";
import { FontAwesome } from "@expo/vector-icons";
import { API_CONFIG } from "../../constants/api.constants";

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = (route.params as SearchScreenParams) || {};

  const [searchQuery, setSearchQuery] = useState(params.searchQuery || "");
  const [activeFilter, setActiveFilter] = useState<PlaceType | null>(
    params.filterType || null
  );

  // Use the usePlaces hook
  const {
    places,
    loading,
    error,
    total,
    page,
    limit,
    fetchPlaces,
    loadMore,
    refresh,
    search,
    filterByType,
  } = usePlaces();

  console.log(params);

  // Reset state when params change
  useEffect(() => {
    setSearchQuery(params.searchQuery || "");
    setActiveFilter(params.filterType || null);
  }, [params.searchQuery, params.filterType]);

  // Fetch data based on params
  useEffect(() => {
    if (params.searchQuery) {
      search(params.searchQuery);
    } else if (params.filterType) {
      filterByType(params.filterType);
    } else if (params.showAllCategories) {
      fetchPlaces();
    } else if (params.showPopularPlaces) {
      fetchPlaces({ sortBy: "rating", sortOrder: "desc" });
    } else {
      // Default: show all categories when params is empty or no specific params
      fetchPlaces();
    }
  }, [
    params.searchQuery,
    params.filterType,
    params.showAllCategories,
    params.showPopularPlaces,
  ]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      search(searchQuery.trim());
    }
  };

  const handleFilterPress = (type: PlaceType) => {
    setActiveFilter(activeFilter === type ? null : type);
    if (activeFilter === type) {
      fetchPlaces(); // Reset to show all places
    } else {
      filterByType(type);
    }
  };

  const handlePlacePress = (place: any) => {
    // Handle place press - you can add navigation to place details here
    console.log("Place pressed:", place);
  };

  const handleReview = (placeId: string, imageUrl: string, address: string) => {
    (navigation as any).navigate("ReviewDetailScreen", {
      placeId,
      imageUrl,
      address,
    });
  };

  // Render place item
  const renderPlace = ({ item }: { item: Place }) => {
   const firstImage = item?.images?.[0];

  const getImageFilename = (img: any) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    // kiểm tra các trường phổ biến nếu img là object
    return img.imageUrl || img.url || img.path || "";
  };

  const filename = getImageFilename(firstImage);

  // chuẩn hoá uploads url (loại bỏ / cuối nếu có)
  const uploadsBase = API_CONFIG.UPLOADS_URL?.replace(/\/$/, "") || "";

  const imageUrl = filename
    ? `${uploadsBase}/${filename}`
    : `https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(
        item?.name || "Địa điểm"
      )}`;

    return (
      <TouchableOpacity
        style={styles.placeCard}
        // onPress={() => handlePlacePress(item)}
        onPress={() => handleReview(item._id, imageUrl, item.location.address)}
      >
        <View style={styles.placeImage}>
          {/* <Text style={styles.placeImageText}>🏢{item.images[0].imageUrl}</Text> */}
          <Image
            source={{
              uri: imageUrl || "https://i.pravatar.cc/100?img=5",
            }}
            style={styles.cardImage}
          />
        </View>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{item.name || "N/A"}</Text>
          <Text style={styles.placeType}>
            {item.type ? item.type.replace("_", " ").toUpperCase() : "N/A"}
          </Text>
          <Text style={styles.placeDescription} numberOfLines={2}>
            {item.description || "N/A"}
          </Text>
          <Text style={styles.placeLocation}>
            {item.location?.city || "N/A"}
          </Text>
          <Text style={styles.placeRating}>⭐ {item.rating || 0}/5</Text>
          <Text style={styles.placePrice}>
            <FontAwesome name="money" size={16} color="#28A745" />{" "}
            {item.priceRange ? item.priceRange.toLocaleString() : 0} VND
          </Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render footer for loading more
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4facfe" />
      </View>
    );
  };

  const getScreenTitle = () => {
    if (params.categoryTitle) return params.categoryTitle;
    if (params.searchQuery) return `Kết quả cho "${params.searchQuery}"`;
    if (params.showAllCategories) return "Danh sách địa điểm";
    if (params.showPopularPlaces) return "Địa điểm phổ biến";
    // Default title when params is empty
    return "Địa điểm";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          {params.filterType && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                // Navigate back to show all categories
                (navigation as any).navigate("Search", {
                  showAllCategories: true,
                });
              }}
            >
              <Text style={styles.clearFilterText}>Tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm địa điểm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <FontAwesome name="search" size={20} color="#4facfe" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filters - Show when viewing all categories or when params is empty */}
      {(params.showAllCategories ||
        (!params.searchQuery &&
          !params.filterType &&
          !params.showPopularPlaces)) && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          >
            {Object.values(PlaceType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  activeFilter === type && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterPress(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    activeFilter === type && styles.activeFilterButtonText,
                  ]}
                >
                  {type.replace("_", " ").toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4facfe" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchPlaces()}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : places && places.length > 0 ? (
          <FlatList
            data={places}
            renderItem={renderPlace}
            keyExtractor={(item) => item._id}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={80} color="#4facfe" />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyDescription}>
              Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
            </Text>
          </View>
        )}
      </View>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
    flex: 1,
  },
  clearFilterButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  clearFilterText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#212529",
    fontWeight: "500",
    paddingVertical: 4,
  },
  searchButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
  },
  searchIcon: {
    fontSize: 20,
    color: "#5A9FD8",
  },
  content: {
    marginTop: 10,
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#DC3545",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#4facfe",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  placeCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  placeImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  placeImageText: {
    fontSize: 36,
    color: "#6C757D",
  },
  placeInfo: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 6,
    lineHeight: 22,
  },
  placeType: {
    fontSize: 12,
    color: "#6C757D",
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  placeDescription: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 8,
    lineHeight: 20,
  },
  placeLocation: {
    fontSize: 13,
    color: "#868E96",
    marginBottom: 8,
    fontWeight: "500",
  },
  placeRating: {
    fontSize: 13,
    color: "#FFC107",
    fontWeight: "600",
    marginBottom: 4,
  },
  placePrice: {
    fontSize: 14,
    color: "#28A745",
    fontWeight: "700",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#E3F2FD",
    color: "#1976D2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  filtersContainer: {
    marginTop: 5,
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterButton: {
    backgroundColor: "#4facfe",
    borderColor: "#4facfe",
    shadowColor: "#4facfe",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 12,
    color: "#6C757D",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  activeFilterButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },
   cardImage: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    borderRadius: 12,
  },
});

export default SearchScreen;

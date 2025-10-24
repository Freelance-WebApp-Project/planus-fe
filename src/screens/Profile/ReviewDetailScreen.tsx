// ReviewDetailScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { feedbackService } from "../../services/feedback.service";
import { Review, ReviewPlace } from "../../types/feedback.types";
import { API_CONFIG } from "../../constants/api.constants";
import { galleryService } from "../../services/gallery.service";
import { showToast } from "../../utils/toast.utils";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hoc/AuthContext";
import { User } from "../../types/auth.types";
import { PlaceResponse } from "../../types/place.types";
import { placeService } from "../../services/place.service";
const noImageIcon = require("../../../assets/splash-icon.png");

const { width } = Dimensions.get("window");

const ReviewDetailScreen = () => {
  const route = useRoute();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { placeId, imageUrl, address, title } = route.params as {
    placeId?: any;
    imageUrl?: string;
    address?: string;
    title?: string;
  };

  const [reviews, setReviews] = useState<Review[]>([]);
  const [place, setPlace] = useState<ReviewPlace>({ _id: "", name: "" });
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    placeId: placeId || "",
    rating: 0,
    comment: "",
    images: [] as string[],
  });
  const [tags, setTags] = useState<string[]>([]);
  const [imgs, setImgs] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getOne = async () => {
    try {
      const response: PlaceResponse = await placeService.getOne(placeId);
      if (response.success && response.data) {
        setTags(response.data?.tags);
        setDescription(response.data?.description);
        setImgs(response.data?.images.map((img) => img.imageUrl) || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getOne();
  }, [placeId]);

  // ✅ Gọi API lấy danh sách review theo placeId
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await feedbackService.getReviewsByPlaceId(placeId);
      if (res.success && res.data?.data?.records) {
        setReviews(res.data?.data?.records);
        const placeInfo = res.data.data.records[0]?.placeId;
        setPlace(placeInfo || { _id: "", name: "" });
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      showToast.error("⚠️ Cần quyền truy cập", "Không thể mở thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setReviewForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newUris],
      }));
    }
  };

  // 🧩 3. Hàm upload ảnh (nếu có)
  const handleUploadImages = async (imageUris: string[]) => {
    if (imageUris.length === 0) return [];
    try {
      return await galleryService.uploadImages(imageUris);
    } catch (error) {
      showToast.error("❌ Lỗi upload ảnh", "Không thể tải ảnh lên máy chủ!");
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      // Kiểm tra chưa chọn sao
      if (reviewForm.rating === 0) {
        showToast.error("⚠️ Chưa chọn sao", "Vui lòng chọn số sao đánh giá!");
        return;
      }

      // Kiểm tra chưa nhập comment và không có ảnh
      if (reviewForm.comment.trim() === "" && reviewForm.images.length === 0) {
        showToast.error("⚠️ Thiếu nội dung", "Vui lòng nhập đánh giá hoặc thêm ảnh!");
        return;
      }

      if (reviewForm.images.length > 3) {
        showToast.error("⚠️ Quá giới hạn", "Tải tối đa 3 ảnh!");
        return;
      }

      setLoading(true); // 🟢 Bắt đầu loading

      let uploadedImages: any[] = [];

      // ✅ Upload ảnh trước
      if (reviewForm.images.length > 0) {
        try {
          uploadedImages = await galleryService.uploadImages(reviewForm.images);
        } catch (uploadErr: any) {
          showToast.error(
            "❌ Lỗi upload ảnh",
            "Không thể tải ảnh lên máy chủ!"
          );
          return;
        }
      }

      // ✅ Gửi review
      const payload = {
        placeId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        images: uploadedImages.map((img) => img._id),
      };

      const response = await feedbackService.createFeedback(payload);

      if (response.success) {
        showToast.success("🎉 Thành công!", "Gửi đánh giá thành công!");
        setReviewForm({
          placeId,
          rating: 0,
          comment: "",
          images: [],
        });
        await fetchReviews();
      } else {
        showToast.error(
          "❌ Gửi thất bại",
          response.message || "Lỗi không xác định"
        );
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi review:", error);
      showToast.error("🚨 Lỗi hệ thống", "Đã xảy ra lỗi khi gửi đánh giá!");
    } finally {
      setLoading(false); // 🔴 Tắt loading dù thành công hay lỗi
    }
  };

  // === Slider ảnh với nút trái/phải ===
  const ImageSlider = ({ images }: { images: string[] }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages =
    images.length > 0
      ? images.map((img) => `${API_CONFIG.UPLOADS_URL}/${img}`)
      : [`https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=${encodeURIComponent(place?.name || "Địa điểm")}`];

  const handleNext = () => {
    if (currentIndex < displayImages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  return (
    <View style={{ height: 200, marginBottom: 10 }}>
      <FlatList
        ref={flatListRef}
        data={displayImages}
        keyExtractor={(item, index) => item + index}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })} // 👈 fix cuộn
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width, height: 200 }} resizeMode="cover" />
        )}
      />
      {currentIndex > 0 && (
        <TouchableOpacity style={[styles.arrowButton, { left: 10 }]} onPress={handlePrev}>
          <FontAwesome name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      {currentIndex < displayImages.length - 1 && (
        <TouchableOpacity style={[styles.arrowButton, { right: 10 }]} onPress={handleNext}>
          <FontAwesome name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "position"}
      keyboardVerticalOffset={Platform.OS === "ios" ? -33 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome name="arrow-left" size={18} color="#4facfe" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Đánh giá địa điểm</Text>
            </View>
            <View style={styles.placeholder} />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                (navigation as any).navigate("MainTabs", { screen: "Home" })
              }
            >
              <FontAwesome name="home" size={20} color="#4facfe" />
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.content}
          >
            {/* Ảnh địa điểm */}
            {/* Ảnh địa điểm dạng slider */}
            <ImageSlider images={imgs} />

            <View style={styles.placeCardContainer}>
              <View style={styles.rowContainer}>
                {/* Bên trái (30%) */}
                <TouchableOpacity style={[styles.placeCard, styles.leftCard]}>
                  <Text>{reviews.length} đánh giá</Text>
                </TouchableOpacity>

                {/* Bên phải (70%) */}
                <View style={[styles.placeCard, styles.rightCard]}>
                  <View style={styles.innerRow}>
                    {/* Bên trái trong phần 70% (chiếm 70%) */}
                    <View style={styles.innerLeft}>
                      <Text style={styles.fieldAddress}>{address}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Bên phải trong phần 70% (chiếm 30%) */}
                    <View style={styles.innerRight}>
                      <FontAwesome
                        name="map-marker"
                        size={20}
                        color="#FF6B6B"
                        style={styles.planDetailIcon}
                      />
                      <Text style={{ fontSize: 18, color: "#4facfe" }}>
                        Bản đồ
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Hàng thứ hai (tags nằm bên dưới) */}
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.placeCardDescription}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.descriptionHeader}>
                <Text style={styles.titleDescription}>
                  Giới thiệu cơ sở lưu trú:
                </Text>
                {description && description.length > 100 && (
                  <FontAwesome 
                    name={isDescriptionExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#4facfe" 
                  />
                )}
              </View>
              <Text 
                style={styles.textDescription} 
                numberOfLines={isDescriptionExpanded ? undefined : 3} 
                ellipsizeMode="tail"
              >
                {description || "Không có"}
              </Text>
            </TouchableOpacity>

            <View style={styles.placeCardDescription}>
              <Text style={styles.titleDescription}>Đánh giá:</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={320} // đúng bằng width của card
                contentContainerStyle={{ paddingHorizontal: 5 }}
              >
                {reviews.length > 0 ? (
                  reviews.map((item) => (
                    <TouchableOpacity key={item._id} style={styles.card}>
                      {/* Header với avatar và tên */}
                      <View style={styles.reviewHeader}>
                        {item.userId?.avatar ? (
                          <Image
                            source={{ uri: item.userId.avatar }}
                            style={styles.reviewAvatar}
                          />
                        ) : (
                          <View style={styles.reviewAvatarPlaceholder}>
                            <FontAwesome name="user" size={16} color="#4facfe" />
                          </View>
                        )}
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.reviewUserName}>
                            {item.userId?.username || "Người dùng ẩn danh"}
                          </Text>
                          <View style={styles.reviewRating}>
                            <FontAwesome name="star" size={12} color="#FFD700" />
                            <Text style={styles.reviewRatingText}>{item.rating}/5</Text>
                          </View>
                        </View>
                      </View>

                      {/* Comment */}
                      <Text style={styles.commentText} numberOfLines={4} ellipsizeMode="tail">
                        {item.comment}
                      </Text>

                      {/* Ảnh đánh giá */}
                      {item.images && item.images.length > 0 ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.reviewImagesContainer}
                        >
                          {item.images.map((img: any) => (
                            <Image
                              key={img._id}
                              source={{
                                uri:
                                  `${API_CONFIG.UPLOADS_URL}/${img.imageUrl}` ||
                                  "https://i.pravatar.cc/100?img=5",
                              }}
                              style={styles.reviewImage}
                            />
                          ))}
                        </ScrollView>
                      ) : (
                        <View style={styles.noImageContainer}>
                          <Image source={noImageIcon} style={styles.noImageIcon} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  // ✅ Thẻ placeholder nếu không có đánh giá nào
                  <View
                    style={[
                      styles.card,
                      { justifyContent: "center", alignItems: "center" },
                    ]}
                  >
                    <FontAwesome name="commenting-o" size={36} color="#ccc" />
                    <Text style={{ color: "#777", marginTop: 8, fontSize: 16 }}>
                      Chưa có đánh giá nào
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* FORM TẠO REVIEW */}
          <View style={styles.cardReview}>
            {/* --- Hàng thông tin user --- */}
            <View style={styles.commentRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#F0F0F0",
                  },
                ]}
              >
                <FontAwesome name="user" size={25} color="#4facfe" />
              </View>
              <Text style={styles.userNameIndent}>
                {user?.username || user?.fullName || "Người dùng ẩn danh"}
              </Text>

              {/* --- Chọn số sao --- */}
              <View style={styles.ratingRowCenter}>
                <Text style={styles.ratingLabel}>
                  {reviewForm.rating === 0 ? "Chọn sao đánh giá *" : "Đánh giá của bạn"}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() =>
                        setReviewForm((prev) => ({ ...prev, rating: star }))
                      }
                    >
                      <FontAwesome
                        name={star <= reviewForm.rating ? "star" : "star-o"}
                        size={24}
                        color={reviewForm.rating === 0 ? "#FF6B6B" : "#FFD700"}
                        style={{ marginHorizontal: 4 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ cảm nhận về địa điểm này..."
                multiline
                value={reviewForm.comment}
                onChangeText={(text) =>
                  setReviewForm((prev) => ({ ...prev, comment: text }))
                }
              />

              <TouchableOpacity
                style={{
                  backgroundColor: "#4facfe",
                  padding: 12,
                  borderRadius: 50,
                  alignSelf: "flex-end", // đẩy về bên phải (tuỳ bạn)
                  marginBottom: 13,
                  marginLeft: 10,
                }}
                onPress={handleSubmit}
              >
                <FontAwesome name="paper-plane" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* --- Danh sách ảnh + nút thêm ảnh --- */}
            <View style={styles.imageRow}>
              {reviewForm.images.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.imagePreview} />
              ))}
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImages}
              >
                <FontAwesome name="camera" size={20} color="#4facfe" />
              </TouchableOpacity>
            </View>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4facfe" />
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ReviewDetailScreen;

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  fieldImage: { width: "100%", height: 200 },
  fieldInfo: { marginTop: 10, marginBottom: 10 },
  fieldName: { fontSize: 20, fontWeight: "bold", color: "#F5F5F5" },
  overlayText: {
    position: "absolute",
    bottom: 18, // đẩy chữ xuống gần đáy ảnh
    left: 10,
    right: 10,
    backgroundColor: "transparent", // nền mờ cho dễ đọc
    padding: 8,
    borderRadius: 8,
  },
  fieldAddress: { fontSize: 14, color: "#4facfe" },
  userRow: { flexDirection: "row", alignItems: "center" },
  placeCardParent: {
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
  placeCardContainer: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 4,
    paddingBottom: 2,
    paddingTop: 5,
    paddingLeft: 5,
    paddingRight: 5,
    marginTop: -28,
  },
  placeCardDescription: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleDescription: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#222",
  },
  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  textDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  placeCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  leftCard: {
    flex: 3, // 30%
  },
  rightCard: {
    flex: 7, // 70%
  },
  innerRow: {
    flexDirection: "row",
    width: "100%",
  },
  innerLeft: {
    flex: 7, // 70% trong phần phải
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  innerRight: {
    flex: 3, // 30% trong phần phải
    justifyContent: "center",
    alignItems: "center",
  },
  planDetailIcon: {
    // marginRight: 1,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  rowContainerRightCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: -10,
    paddingHorizontal: -15,
  },
  avatar: { width: 25, height: 25, borderRadius: 15 },
  userName: { fontWeight: "bold", fontSize: 16 },
  reviewDate: { fontSize: 13, color: "#777" },
  comment: { fontSize: 15, lineHeight: 22, marginVertical: 2 },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 45,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4facfe",
    marginTop: 2,
  },
  placeholder: { width: 36 },
  content: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  // card: {
  //   backgroundColor: "#fff",
  //   borderRadius: 12,
  //   paddingHorizontal: 20,
  //   paddingVertical: 26,
  //   marginTop: 10,
  //   shadowColor: "#000",
  //   shadowOpacity: 0.08,
  //   shadowRadius: 6,
  //   shadowOffset: { width: 0, height: 3 },
  //   elevation: 3,
  // },
  userNameIndent: {
    fontWeight: "700",
    fontSize: 16,
    marginRight: 15,
    marginLeft: 3,
    // marginTop: 10,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: -20,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    minHeight: 45,
    textAlignVertical: "top",
    fontSize: 14,
    marginBottom: 10,
    color: "#333",
  },
  ratingRowCenter: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: -20,
  },
  addImageButton: {
    width: 65,
    height: 65,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F4FF",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 8,
    marginBottom: 8,
  },
  deleteButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  imagePreview: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)", // mờ nhẹ
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    minHeight: 30,
  },
  tag: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#6C757D",
  },
  card: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardReview: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 26,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
    marginLeft: -190,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#555",
  },
  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -12 }],
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  // New styles for improved review layout
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  reviewAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewRatingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  reviewImagesContainer: {
    marginTop: 8,
  },
  noImageContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 16,
  },
  noImageIcon: {
    width: 40,
    height: 40,
    opacity: 0.3,
  },
});

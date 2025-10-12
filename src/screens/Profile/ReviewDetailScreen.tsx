import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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

const ReviewDetailScreen = () => {
  const route = useRoute();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { placeId } = route.params as {
    placeId?: any;
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
      if (
        reviewForm.rating === 0 &&
        reviewForm.comment.trim() === "" &&
        reviewForm.images.length === 0
      ) {
        showToast.error("⚠️ Thiếu thông tin", "Bạn chưa nhập đánh giá nào!");
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

  return (
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
          <Text style={styles.headerSubtitle}>{place?.name}</Text>
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

      <ScrollView style={styles.content}>
        {/* Ảnh địa điểm */}
        <Image
          source={{
            uri: "https://i.pravatar.cc/100?img=5",
          }}
          style={styles.fieldImage}
        />

        {/* Thông tin địa điểm */}
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>
            {place?.name || "Không rõ tên địa điểm"}
          </Text>
          <Text style={styles.fieldAddress}>Địa chỉ: Đang cập nhật</Text>
        </View>

        {/* DANH SÁCH REVIEW */}
        {reviews.length > 0 ? (
          reviews.map((review: any, index: number) => (
            <View key={review._id}>
              {/* User info */}
              <View style={styles.userRow}>
                <Image
                  source={{
                    uri:
                      review.userId?.avatar ||
                      "https://i.pravatar.cc/100?img=5",
                  }}
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.userName}>
                    {review.userId?.username || "Người dùng ẩn danh"}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome
                    key={star}
                    name={star <= review.rating ? "star" : "star-o"}
                    color="#FFD700"
                    size={22}
                    style={{ marginHorizontal: 4 }}
                  />
                ))}
                <Text style={styles.ratingText}>
                  {review.rating.toFixed(1)}
                </Text>
              </View>

              {/* Comment */}
              {review.comment ? (
                <Text style={styles.comment}>{review.comment}</Text>
              ) : null}

              {/* Review images */}
              {review.images && review.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {review.images.map((img: any) => (
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
              )}

              {/* --- Đường kẻ tách review --- */}
              {index < reviews.length - 1 && <View style={styles.separator} />}
            </View>
          ))
        ) : (
          <Text
            style={{ textAlign: "center", color: "#777", marginVertical: 20 }}
          >
            Chưa có đánh giá nào
          </Text>
        )}
      </ScrollView>

      {/* FORM TẠO REVIEW */}
      <View style={styles.card}>
        {/* --- Hàng thông tin user --- */}
        <View style={styles.commentRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100?img=5" }}
            style={styles.avatar}
          />
          <Text style={styles.userNameIndent}>
            {user?.username || user?.fullName || "Người dùng ẩn danh"}
          </Text>
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

        {/* --- Chọn số sao --- */}
        <View style={styles.ratingRowCenter}>
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
                color="#FFD700"
                style={{ marginHorizontal: 4 }}
              />
            </TouchableOpacity>
          ))}
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
  );
};

export default ReviewDetailScreen;

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  fieldImage: { width: "100%", height: 200, borderRadius: 10, marginTop: 10 },
  fieldInfo: { marginTop: 10, marginBottom: 10 },
  fieldName: { fontSize: 20, fontWeight: "bold" },
  fieldAddress: { fontSize: 14, color: "#777", marginTop: 4 },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 45, height: 45, borderRadius: 25, marginRight: 10 },
  userName: { fontWeight: "bold", fontSize: 16 },
  reviewDate: { fontSize: 13, color: "#777" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: { marginLeft: 6, fontSize: 15, color: "#444" },
  comment: { fontSize: 15, lineHeight: 22, marginVertical: 2 },
  reviewImage: { width: 120, height: 120, borderRadius: 10, marginRight: 8 },
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#212529" },
  titleContainer: {
    flexDirection: "column", // 👈 giúp 2 text xếp dọc
    alignItems: "center", // căn giữa theo chiều ngang (nếu muốn)
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#4facfe",
    marginTop: 2,
  },
  placeholder: { width: 36 },
  content: { flex: 1, paddingHorizontal: 20 },
  card: {
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
  userNameIndent: {
    fontWeight: "700",
    fontSize: 16,
    marginTop: 10,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    marginTop: -15,
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
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
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
  },
});

import { supabase } from "../../lib/supabase";
import type { User } from "../stores/authStore";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Map Supabase row → app User type */
function rowToUser(row: Record<string, unknown>): User {
  return {
    uid: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string,
    phone: (row.phone as string | null) ?? undefined,
    avatarUrl: (row.avatar_url as string | null) ?? undefined,
    age: (row.age as number | null) ?? undefined,
    gender: (row.gender as User["gender"]) ?? undefined,
    skillLevel: row.skill_level as number,
    sports: (row.sports as string[]) ?? [],
    location: {
      city: row.city as string,
      lat: (row.lat as number | null) ?? undefined,
      lng: (row.lng as number | null) ?? undefined,
    },
    radiusKm: row.radius_km as number,
    bio: (row.bio as string | null) ?? undefined,
    role: (row.role as User["role"]) ?? "player",
    reputation: {
      score: row.reputation_score as number,
      attendanceRate: row.attendance_rate as number,
      avgRating: row.avg_rating as number,
    },
    badges: (row.badges as string[]) ?? [],
  };
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
interface LoginData {
  email: string;
  password: string;
}
interface AuthResponse {
  user: User;
  token: string;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const supabaseAuth = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error || !authData.user)
      throw new Error(error?.message ?? "Đăng ký thất bại");

    const profileData = {
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone ?? null,
      skill_level: 3,
      sports: [],
      city: "",
      radius_km: 10,
      reputation_score: 100,
      attendance_rate: 0,
      avg_rating: 0,
      total_games: 0,
      role: "player" as const,
      badges: ["Active Newcomer"],
    };

    const { error: profileError } = await supabase
      .from("users")
      .insert(profileData);
    if (profileError) throw new Error(profileError.message);

    return {
      user: rowToUser(profileData),
      token: authData.session?.access_token ?? "",
    };
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error || !authData.user)
      throw new Error("Email hoặc mật khẩu không đúng.");

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();
    if (profileError || !profile) throw new Error("Không tải được hồ sơ.");

    return {
      user: rowToUser(profile),
      token: authData.session?.access_token ?? "",
    };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export const supabaseProfile = {
  getProfile: async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) throw new Error("Không tải được hồ sơ.");
    return rowToUser(data);
  },

  updateProfile: async (
    userId: string,
    updates: Partial<User>,
  ): Promise<User> => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.avatarUrl !== undefined)
      dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.skillLevel !== undefined)
      dbUpdates.skill_level = updates.skillLevel;
    if (updates.sports !== undefined) dbUpdates.sports = updates.sports;
    if (updates.radiusKm !== undefined) dbUpdates.radius_km = updates.radiusKm;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.location !== undefined) {
      dbUpdates.city = updates.location.city;
      dbUpdates.lat = updates.location.lat ?? null;
      dbUpdates.lng = updates.location.lng ?? null;
    }
    if (updates.badges !== undefined) dbUpdates.badges = updates.badges;

    const { data, error } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", userId)
      .select()
      .single();
    if (error || !data) throw new Error("Cập nhật thất bại.");
    return rowToUser(data);
  },

  getPublicProfile: async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) throw new Error("Không tìm thấy người dùng.");
    return rowToUser(data);
  },
};

// ─── VENUES ──────────────────────────────────────────────────────────────────

export const supabaseVenues = {
  getVenues: async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("is_active", true)
      .order("rating", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  getVenueById: async (id: string) => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) throw new Error("Không tìm thấy sân.");
    return data;
  },

  getVenuesByOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  createVenue: async (venue: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from("venues")
      .insert(venue)
      .select()
      .single();
    if (error || !data) throw new Error("Tạo sân thất bại.");
    return data;
  },
};

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

export const supabaseBookings = {
  getBookingsByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, venues(name, address, images)")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  createBooking: async (booking: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from("bookings")
      .insert(booking)
      .select()
      .single();
    if (error || !data) throw new Error("Đặt sân thất bại.");
    return data;
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select()
      .single();
    if (error || !data) throw new Error("Cập nhật thất bại.");
    return data;
  },
};

// ─── POSTS / FEED ─────────────────────────────────────────────────────────────

export const supabaseFeed = {
  getPosts: async (limit = 20, offset = 0) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, users!author_id(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  createPost: async (post: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from("posts")
      .insert(post)
      .select()
      .single();
    if (error || !data) throw new Error("Đăng bài thất bại.");
    return data;
  },

  toggleLike: async (postId: string, userId: string, liked: boolean) => {
    const col = liked
      ? `likes = array_append(likes, '${userId}')`
      : `likes = array_remove(likes, '${userId}')`;
    const { error } = await supabase.rpc("toggle_post_like", {
      p_post_id: postId,
      p_user_id: userId,
      p_liked: liked,
    });
    if (error) throw new Error(error.message);
  },
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export const supabaseChat = {
  getChats: async (userId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .contains("members", [userId])
      .order("last_message_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  getMessages: async (chatId: string, limit = 50) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  sendMessage: async (msg: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert(msg)
      .select()
      .single();
    if (error || !data) throw new Error("Gửi tin nhắn thất bại.");
    return data;
  },
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export const supabaseAdmin = {
  getUsers: async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToUser);
  },

  getReports: async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  updateReportStatus: async (reportId: string, status: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId);
    if (error) throw new Error(error.message);
  },

  banUser: async (userId: string, banned: boolean) => {
    const { error } = await supabase
      .from("users")
      .update({ is_banned: banned })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  },
};

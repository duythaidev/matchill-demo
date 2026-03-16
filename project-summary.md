# Tài liệu Tổng quan Dự án Matchill

## 1. Giới thiệu

**Matchill** là một web app kết hợp **social + booking + matchmaking thể thao**, chủ yếu hướng đến hai nhóm người dùng:

* **Người chơi thể thao (Player)**
* **Chủ sân (Venue Owner)**

Ứng dụng được xây dựng theo kiến trúc **SPA (Single Page Application)** với:

* **Frontend:** React + Vite
* **Routing:** `routes.tsx`
* **State Management:** Zustand
* **API:** Mock API (dữ liệu demo) + cấu hình tích hợp Supabase thông qua `IS_INTEGRATE_API` trong `config.ts`

Các store chính quản lý state:

* auth
* booking
* chat
* feed
* match
* find-partner

---

# 2. Các Module Chính

## 2.1 Authentication & Profile

### Các trang

* `LoginPage`
* `RegisterPage`
* `ProfilePage`
* `PublicProfilePage`

### Quản lý user hiện tại

Store:

```
authStore.ts
```

Mock API:

```
api.ts
```

### Role-based Redirect

Route `/` sẽ redirect dựa trên role của user:

| Role        | Redirect     |
| ----------- | ------------ |
| Player      | `/discover`  |
| Venue Owner | `/my-venues` |
| Admin       | `/admin`     |

Logic redirect được xử lý trong:

```
routes.tsx
RootRedirect
ProtectedLayout
```

---

## 2.2 Role & Quyền (Routing + Layout)

### Protected Layout

Component:

```
ProtectedLayout
```

Dùng:

```
useAuthStore.isAuthenticated
```

để chặn truy cập khi user chưa đăng nhập.

### Các Role

Hệ thống có **3 role chính**

```
player
venueOwner
admin
```

### Các route theo role

| Role        | Routes                                                           |
| ----------- | ---------------------------------------------------------------- |
| Admin       | `/admin/**`                                                      |
| Venue Owner | `/my-venues`, `/venue/create`, `/venue/dashboard`                |
| Player      | `/discover`, `/feed`, `/chat`, `/find-partner`, `/match-request` |

---

# 2.3 Booking & Venue (Booking System)

### Các trang

```
/venues
/venues/:venueId
/booking/:venueId
/my-bookings
/my-venues
/venue/create
/venue/dashboard
```

### Chức năng

* Xem danh sách sân
* Xem chi tiết sân
* Đặt sân
* Xem lịch sử booking
* Chủ sân quản lý sân
* Dashboard doanh thu

### Store chính

```
bookingStore.ts
```

State chính:

```
venues
myVenues
myBookings
pendingBookingRequests
walletBalance
selectedSlots
```

### Actions

```
addBooking
acceptBookingRequest
rejectBookingRequest
toggleSlot
deductWallet
```

### Logic hệ thống

Người chơi:

* chọn slot
* đặt sân
* xem lịch sử booking

Chủ sân:

* xem yêu cầu booking
* accept / reject request

Dữ liệu hiện tại đang dùng **mock data**.

---

# 2.4 Matchmaking (Tìm teammate / nhóm)

Hệ thống matchmaking có **2 phần khác nhau**.

---

## A) Match Request (Match + Open Teams)

Route:

```
/match-request/create
```

### Chức năng

* Tạo **match request**
* Xem **suggested players**
* Xem **open teams**

### Store

```
matchStore.ts
```

State:

```
currentRequest
suggestions
openTeams
filters
activeTab
```

### Mock Data

```
matchVenueApi.ts
```

Bao gồm:

```
MOCK_PLAYERS
MOCK_OPEN_TEAMS
```

---

## B) Find Partner (Tìm đồng đội nhanh)

Route:

```
/find-partner
```

### Chức năng

* nhập criteria
* tìm nhóm
* tạo chat ngay

### Store

```
findPartnerStore.ts
```

### API Mock

```
findPartnerApi.ts
```

Logic giả lập:

```
80% tìm thấy partner
20% không tìm thấy
```

Sau đó trả về:

```
group
chatId
```

---

# 2.5 Social Feed + Chat

## Feed

Route:

```
/feed
```

Page:

```
FeedPage.tsx
```

Store:

```
feedStore.ts
```

Mock API:

```
feedChatApi.ts
```

Data:

```
MOCK_POSTS
```

### Functions

```
like
save
comment
share
```

State lưu:

```
posts
comments
```

---

## Chat

Routes:

```
/chat
/chat/:chatId
```

Pages:

```
chat list
chat conversation
```

Store:

```
chatStore.ts
```

Mock API:

```
feedChatApi.ts
```

Data:

```
MOCK_CHATS
MOCK_MESSAGES
```

### Logic

* lưu messages theo room
* tính total unread
* đánh dấu read
* thêm message mới

---

# 2.6 Rating & Reports

Route:

```
/rating/:activityId
```

Page:

```
RatingPage.tsx
```

Model:

```
RatingSubmit
```

(định nghĩa trong `feedChatApi.ts`)

### Mục đích

* rating match
* rating booking
* report user hoặc nội dung

Hiện đang dùng **mock data**.

---

# 2.7 Admin Dashboard

Routes:

```
/admin
/admin/reports
/admin/users
```

Page:

```
AdminPage.tsx
```

Mock types:

```
AdminUser
Report
```

(API từ `feedChatApi.ts`)

### Chức năng dự kiến

* quản lý user
* quản lý nội dung
* xem report

---

# 3. Liên kết Logic giữa các Module

## Authentication Flow

```
Auth
↓
ProtectedLayout
↓
Pages
```

Nếu chưa login:

```
redirect → /login
```

Sau khi login:

```
redirect theo role
```

---

## Shared Store

```
authStore
```

cung cấp:

```
currentUser
```

cho các module:

* profile
* chat
* feed
* match
* booking

---

## Các Store Chính

```
bookingStore
matchStore
findPartnerStore
```

dùng để lưu **trạng thái tạm (mock state)**.

---

# 4. Mock API Structure

Các file API chính:

```
api.ts
```

* login
* register
* profile

```
feedChatApi.ts
```

* feed
* chat
* rating
* admin

```
matchVenueApi.ts
```

* match player
* open teams

```
findPartnerApi.ts
```

* tìm partner

---

# 5. Config Toggle API

File:

```
config.ts
```

Biến:

```
IS_INTEGRATE_API
```

Mục đích:

* quyết định dùng **mock API**
* hoặc **Supabase API**

Supabase integration nằm trong:

```
supabaseApi.ts
```

nhưng hiện **chưa được triển khai hoàn chỉnh**.

---

# 6. Gợi ý nếu muốn phân tích sâu hơn

Nếu cần phân tích chi tiết hơn, có thể:

### 1. Phân tích từng Page

```
src/app/pages/*.tsx
```

### 2. Map Flow

```
page
↓
store
↓
api
```

Ví dụ:

```
MatchRequestCreatePage
↓
useMatchStore
↓
matchVenueApi.ts
```

Điều này giúp hiểu rõ:

* nút bấm nào dẫn đến page nào
* action nào gọi API nào
* state nào được cập nhật

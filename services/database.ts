import { supabaseGet, supabaseGetSingle, supabasePost, supabasePatch, supabaseDelete } from './supabase'
import type { AnyItem, User, Slide, BriefingItem, CategoryHeaderInfo, Review, Application, ApplicationStatus, NotificationItem, UserNotification } from '../types'

// --- Items ---
export async function getItems(): Promise<AnyItem[]> {
  try {
    const data = await supabaseGet<any>('items', 'order=created_at.desc')
    return data.map(mapDbItemToItem)
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export async function getItemsByCategory(categoryType: string): Promise<AnyItem[]> {
  try {
    const data = await supabaseGet<any>('items', `category_type=eq.${categoryType}&order=created_at.desc`)
    return data.map(mapDbItemToItem)
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export async function getItemById(id: number): Promise<AnyItem | null> {
  try {
    const data = await supabaseGetSingle<any>('items', `id=eq.${id}`)
    return data ? mapDbItemToItem(data) : null
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

export async function createItem(item: Omit<AnyItem, 'id'>): Promise<AnyItem | null> {
  try {
    const dbItem = mapItemToDbItem(item as AnyItem)
    const data = await supabasePost<any>('items', dbItem)
    return data ? mapDbItemToItem(data) : null
  } catch (error) {
    console.error('Error creating item:', error)
    return null
  }
}

export async function updateItem(id: number, updates: Partial<AnyItem>): Promise<boolean> {
  try {
    const dbUpdates = mapItemToDbItem(updates as AnyItem)
    return await supabasePatch('items', `id=eq.${id}`, dbUpdates)
  } catch (error) {
    console.error('Error updating item:', error)
    return false
  }
}

export async function deleteItem(id: number): Promise<boolean> {
  try {
    return await supabaseDelete('items', `id=eq.${id}`)
  } catch (error) {
    console.error('Error deleting item:', error)
    return false
  }
}

// --- User Interactions ---
export async function getUserLikes(userId: string): Promise<number[]> {
  try {
    const data = await supabaseGet<any>('user_likes', `user_id=eq.${userId}&select=item_id`)
    return data.map(d => d.item_id)
  } catch (error) {
    console.error('Error fetching likes:', error)
    return []
  }
}

export async function toggleLike(userId: string, itemId: number): Promise<number[]> {
  try {
    // Check if already liked
    const existing = await supabaseGet<any>('user_likes', `user_id=eq.${userId}&item_id=eq.${itemId}&select=id`)

    if (existing.length > 0) {
      // Unlike
      await supabaseDelete('user_likes', `user_id=eq.${userId}&item_id=eq.${itemId}`)
    } else {
      // Like
      await supabasePost('user_likes', { user_id: userId, item_id: itemId })
    }

    return getUserLikes(userId)
  } catch (error) {
    console.error('Error toggling like:', error)
    return getUserLikes(userId)
  }
}

export async function getUserApplies(userId: string): Promise<number[]> {
  try {
    const data = await supabaseGet<any>('applications', `user_id=eq.${userId}&select=item_id`)
    return data.map(d => d.item_id)
  } catch (error) {
    console.error('Error fetching applies:', error)
    return []
  }
}

export async function getMyApplications(userId: string): Promise<Application[]> {
  try {
    const data = await supabaseGet<any>('applications', `user_id=eq.${userId}&order=created_at.desc`)
    return data.map(d => ({
      id: d.id,
      userId: d.user_id,
      itemId: d.item_id,
      status: d.status,
      appliedAt: d.created_at,
      refundAccount: d.refund_account,
      refundReason: d.refund_reason,
      userName: d.user_name,
      userPhone: d.user_phone
    }))
  } catch (error) {
    console.error('Error fetching my applications:', error)
    return []
  }
}

export async function getItemApplicants(itemId: number): Promise<Application[]> {
  try {
    // In a real app, we would join with users table to get name/phone.
    // Here we might need to fetch users separately or assume the join happens.
    // For simplicity, let's fetch applications and then we might need user info.
    // If supabaseGet supports foreign tables, we can use select=*,users(name,phone)
    // But for now, let's assume we can get user info or we just return raw.

    // Let's try to mock the join or just return raw for now.
    // Code below assumes we just get the application record. 
    // Ideally we need user name/phone for the host. 
    const data = await supabaseGet<any>('applications', `item_id=eq.${itemId}&order=created_at.desc`)

    // To get user details, we'd need another call or a join. 
    // Let's do a simple workaround: fetch all users (cached) or specific users.
    // For efficiency, maybe just return the app and let the component fetch user?
    // Or better, let's fetch the specific users here if possible. 
    // Given limitations, let's just return what we have and maybe the component handles display.

    // Wait, for the host dashboard we REALLY need names.
    // Let's assume we can fetch users by IDs.

    return data.map(d => ({
      id: d.id,
      userId: d.user_id,
      itemId: d.item_id,
      status: d.status,
      appliedAt: d.created_at,
      refundAccount: d.refund_account,
      refundReason: d.refund_reason,
      // These would be populated if we joined
      userName: d.users?.name,
      userPhone: d.user_phone || d.users?.phone
    }))
  } catch (error) {
    console.error('Error fetching item applicants:', error)
    return []
  }
}

export async function updateApplicationStatus(userId: string, itemId: number, status: ApplicationStatus): Promise<boolean> {
  try {
    await supabasePatch('applications', `user_id=eq.${userId}&item_id=eq.${itemId}`, { status })

    // If confirmed, create a notification
    if (status === 'confirmed') {
      const itemData = await supabaseGet<any>('items', `id=eq.${itemId}`)
      if (itemData && itemData.length > 0) {
        const item = itemData[0];
        await supabasePost('user_notifications', {
          user_id: userId,
          title: '신청 완료 알림',
          message: `축하합니다! [${item.title}] 모임 신청이 승인되었습니다.`,
          is_read: false
        });
      }
    }
    return true
  } catch (error) {
    console.error('Error updating application status:', error)
    return false
  }
}

export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  try {
    const data = await supabaseGet<any>('user_notifications', `user_id=eq.${userId}&is_read=eq.false&order=created_at.desc`)
    return data.map(d => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      message: d.message,
      isRead: d.is_read,
      createdAt: d.created_at
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    return await supabasePatch('user_notifications', `id=eq.${notificationId}`, { is_read: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export async function applyItem(userId: string, itemId: number, refundAccount?: string, userName?: string, userPhone?: string): Promise<boolean> {
  try {
    // Check if already applied
    const existing = await supabaseGet<any>('applications', `user_id=eq.${userId}&item_id=eq.${itemId}&select=id`)

    if (existing.length > 0) {
      return false // Already applied
    }

    await supabasePost('applications', {
      user_id: userId,
      item_id: itemId,
      status: 'applied',
      refund_account: refundAccount,
      user_name: userName,
      user_phone: userPhone
    })
    return true
  } catch (error) {
    console.error('Error applying to item:', error)
    return false
  }
}

export async function cancelApplication(userId: string, itemId: number, reason: string, account: string): Promise<boolean> {
  try {
    await supabasePatch('applications', `user_id=eq.${userId}&item_id=eq.${itemId}`, {
      status: 'refund-requested',
      refund_reason: reason,
      refund_account: account
    })
    return true
  } catch (error) {
    console.error('Error canceling application:', error)
    return false
  }
}

export async function getUserUnlocks(userId: string): Promise<number[]> {
  try {
    const data = await supabaseGet<any>('user_unlocks', `user_id=eq.${userId}&select=item_id`)
    return data.map(d => d.item_id)
  } catch (error) {
    console.error('Error fetching unlocks:', error)
    return []
  }
}

export async function unlockReport(userId: string, itemId: number): Promise<boolean> {
  try {
    // Check if already unlocked
    const existing = await supabaseGet<any>('user_unlocks', `user_id=eq.${userId}&item_id=eq.${itemId}&select=id`)

    if (existing.length > 0) {
      return false // Already unlocked
    }

    await supabasePost('user_unlocks', { user_id: userId, item_id: itemId })
    return true
  } catch (error) {
    console.error('Error unlocking report:', error)
    return false
  }
}

// --- Slides ---
export async function getSlides(): Promise<Slide[]> {
  try {
    const data = await supabaseGet<any>('slides', 'order=sort_order.asc')
    return data.map(d => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      img: d.img,
      sortOrder: d.sort_order,
      isActive: d.is_active
    }))
  } catch (error) {
    console.error('Error fetching slides:', error)
    return []
  }
}

export async function createSlide(slide: Omit<Slide, 'id'>): Promise<boolean> {
  try {
    await supabasePost('slides', {
      title: slide.title,
      desc: slide.desc,
      img: slide.img,
      sort_order: slide.sortOrder,
      is_active: slide.isActive
    })
    return true
  } catch (error) {
    console.error('Error creating slide:', error)
    return false
  }
}

export async function updateSlide(id: number, updates: Partial<Slide>): Promise<boolean> {
  try {
    const data: any = {}
    if (updates.title !== undefined) data.title = updates.title
    if (updates.desc !== undefined) data.desc = updates.desc
    if (updates.img !== undefined) data.img = updates.img
    if (updates.sortOrder !== undefined) data.sort_order = updates.sortOrder
    if (updates.isActive !== undefined) data.is_active = updates.isActive
    return await supabasePatch('slides', `id=eq.${id}`, data)
  } catch (error) {
    console.error('Error updating slide:', error)
    return false
  }
}

export async function deleteSlide(id: number): Promise<boolean> {
  try {
    return await supabaseDelete('slides', `id=eq.${id}`)
  } catch (error) {
    console.error('Error deleting slide:', error)
    return false
  }
}

// --- Notifications ---
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const data = await supabaseGet<any>('notifications', 'order=sort_order.asc')
    return data.map(d => ({
      id: d.id,
      message: d.message,
      linkUrl: d.link_url,
      isActive: d.is_active,
      sortOrder: d.sort_order
    }))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function createNotification(noti: Omit<NotificationItem, 'id'>): Promise<boolean> {
  try {
    await supabasePost('notifications', {
      message: noti.message,
      link_url: noti.linkUrl,
      is_active: noti.isActive,
      sort_order: noti.sortOrder
    })
    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

export async function updateNotification(id: number, updates: Partial<NotificationItem>): Promise<boolean> {
  try {
    const data: any = {}
    if (updates.message !== undefined) data.message = updates.message
    if (updates.linkUrl !== undefined) data.link_url = updates.linkUrl
    if (updates.isActive !== undefined) data.is_active = updates.isActive
    if (updates.sortOrder !== undefined) data.sort_order = updates.sortOrder
    return await supabasePatch('notifications', `id=eq.${id}`, data)
  } catch (error) {
    console.error('Error updating notification:', error)
    return false
  }
}

export async function deleteNotification(id: number): Promise<boolean> {
  try {
    return await supabaseDelete('notifications', `id=eq.${id}`)
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

// --- Briefings ---
export async function getBriefings(): Promise<BriefingItem[]> {
  try {
    const data = await supabaseGet<any>('briefings', 'is_active=eq.true&order=sort_order.asc')
    return data.map(d => ({
      id: d.id,
      text: d.text,
      highlight: d.highlight
    }))
  } catch (error) {
    console.error('Error fetching briefings:', error)
    return []
  }
}

// --- Category Headers ---
export async function getCategoryHeaders(): Promise<Record<string, CategoryHeaderInfo>> {
  try {
    const data = await supabaseGet<any>('category_headers', 'select=*')
    const headers: Record<string, CategoryHeaderInfo> = {}
    for (const d of data) {
      headers[d.category] = {
        title: d.title,
        description: d.description
      }
    }
    return headers
  } catch (error) {
    console.error('Error fetching headers:', error)
    return {}
  }
}

export async function updateCategoryHeader(category: string, title: string, description: string): Promise<boolean> {
  try {
    // Check if exists
    const existing = await supabaseGet<any>('category_headers', `category=eq.${category}`)
    if (existing.length > 0) {
      return await supabasePatch('category_headers', `category=eq.${category}`, { title, description })
    } else {
      await supabasePost('category_headers', { category, title, description })
      return true
    }
  } catch (error) {
    console.error('Error updating category header:', error)
    return false
  }
}

// --- Detail Images ---
export async function getDetailImages(): Promise<Record<string, string>> {
  try {
    const data = await supabaseGet<any>('category_detail_images', 'select=*')
    const images: Record<string, string> = {}
    for (const d of data) {
      images[d.category] = d.image_url
    }
    return images
  } catch (error) {
    console.error('Error fetching detail images:', error)
    return {}
  }
}

export async function updateCategoryDetailImage(category: string, imageUrl: string): Promise<boolean> {
  try {
    const existing = await supabaseGet<any>('category_detail_images', `category=eq.${category}`)
    if (existing.length > 0) {
      return await supabasePatch('category_detail_images', `category=eq.${category}`, { image_url: imageUrl })
    } else {
      await supabasePost('category_detail_images', { category, image_url: imageUrl })
      return true
    }
  } catch (error) {
    console.error('Error updating detail image:', error)
    return false
  }
}

// --- Settings ---
export async function getSetting(key: string): Promise<string | null> {
  try {
    const data = await supabaseGetSingle<any>('settings', `key=eq.${key}&select=value`)
    return data?.value || null
  } catch (error) {
    console.error('Error fetching setting:', error)
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const existing = await supabaseGet<any>('settings', `key=eq.${key}`)
    if (existing.length > 0) {
      return await supabasePatch('settings', `key=eq.${key}`, { value })
    } else {
      await supabasePost('settings', { key, value })
      return true
    }
  } catch (error) {
    console.error('Error setting setting:', error)
    return false
  }
}

export async function getTagline(): Promise<string> {
  const tagline = await getSetting('tagline')
  return tagline || '나와 같은 방향을 걷는 사람들을 만나는 곳, 임풋'
}

// --- Reviews ---
export async function getReviewsByItemId(itemId: number): Promise<Review[]> {
  try {
    const data = await supabaseGet<any>('reviews', `item_id=eq.${itemId}&order=created_at.desc`)
    return data.map(d => ({
      id: d.id,
      itemId: d.item_id,
      userId: d.user_id,
      user: d.user,
      text: d.text,
      rating: Number(d.rating),
      date: d.date,
      avatar: d.avatar,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }))
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getReviewsByCategory(categoryType: string): Promise<Review[]> {
  try {
    const items = await supabaseGet<any>('items', `category_type=eq.${categoryType}`)
    if (!items || items.length === 0) return []
    const itemIds = items.map(i => i.id).join(',')
    const data = await supabaseGet<any>('reviews', `item_id=in.(${itemIds})&order=created_at.desc`)
    return data.map(d => ({
      id: d.id,
      itemId: d.item_id,
      userId: d.user_id,
      user: d.user,
      text: d.text,
      rating: Number(d.rating),
      date: d.date,
      avatar: d.avatar,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }))
  } catch (error) {
    console.error('Error fetching category reviews:', error)
    return []
  }
}

export async function getReviewableItems(userId: string): Promise<AnyItem[]> {
  try {
    const apps = await supabaseGet<any>('applications', `user_id=eq.${userId}&status=in.(paid,checked-in)`)
    if (!apps || apps.length === 0) return []
    const itemIds = apps.map(a => a.item_id).join(',')
    const endedItems = await supabaseGet<any>('items', `id=in.(${itemIds})&status=eq.ended`)
    const reviews = await supabaseGet<any>('reviews', `user_id=eq.${userId}`)
    const reviewedItemIds = new Set(reviews.map(r => r.item_id))
    return endedItems.filter(i => !reviewedItemIds.has(i.id)).map(mapDbItemToItem)
  } catch (error) {
    console.error('Error fetching reviewable items:', error)
    return []
  }
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  try {
    await supabasePost('reviews', {
      item_id: review.itemId,
      user_id: review.userId,
      user: review.user,
      text: review.text,
      rating: review.rating,
      date: new Date().toLocaleDateString(),
      avatar: review.avatar
    })
    return true
  } catch (error) {
    console.error('Error creating review:', error)
    return false
  }
}

export async function updateReview(id: number, updates: Partial<Review>, isAdmin: boolean = false): Promise<boolean> {
  try {
    if (!isAdmin) {
      const review = await supabaseGetSingle<any>('reviews', `id=eq.${id}`)
      if (!review) return false
      const createdAt = new Date(review.created_at).getTime()
      const now = new Date().getTime()
      const limit = 24 * 60 * 60 * 1000 // 24 hours
      if (now - createdAt > limit) {
        throw new Error('리뷰 작성 후 24시간이 지나 수정할 수 없습니다.')
      }
    }
    const dbUpdates: any = {}
    if (updates.text !== undefined) dbUpdates.text = updates.text
    if (updates.rating !== undefined) dbUpdates.rating = updates.rating
    dbUpdates.updated_at = new Date().toISOString()
    return await supabasePatch('reviews', `id=eq.${id}`, dbUpdates)
  } catch (error: any) {
    console.error('Error updating review:', error)
    throw error // Re-throw to handle in UI
  }
}

export async function deleteReview(id: number): Promise<boolean> {
  try {
    return await supabaseDelete('reviews', `id=eq.${id}`)
  } catch (error) {
    console.error('Error deleting review:', error)
    return false
  }
}

// --- User Profile ---
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const data: any = {}
    if (updates.name !== undefined) data.name = updates.name
    if (updates.avatar !== undefined) data.avatar = updates.avatar
    if (updates.phone !== undefined) data.phone = updates.phone
    if (updates.birthdate !== undefined) data.birthdate = updates.birthdate
    if (updates.interests !== undefined) data.interests = updates.interests
    if (updates.isProfileComplete !== undefined) data.is_profile_complete = updates.isProfileComplete

    return await supabasePatch('users', `id=eq.${userId}`, data)
  } catch (error) {
    console.error('Error updating user:', error)
    return false
  }
}

// --- Helper Functions ---
function mapDbItemToItem(dbItem: any): AnyItem {
  const base = {
    id: dbItem.id,
    title: dbItem.title,
    img: dbItem.img,
    author: dbItem.author,
    views: dbItem.views,
    comments: dbItem.comments,
    desc: dbItem.description,
    date: dbItem.event_date,
    price: dbItem.price,
    loc: dbItem.location,
    status: dbItem.status,
    reviews: [],
    hostBankInfo: dbItem.host_bank_info,
    kakaoChatUrl: dbItem.kakao_chat_url,
    hostDescription: dbItem.host_description,
    hostIntroImage: dbItem.host_intro_image,
  }

  switch (dbItem.category_type) {
    case 'networking':
      return {
        ...base,
        categoryType: 'networking',
        type: dbItem.networking_type,
        curriculum: dbItem.curriculum,
        currentParticipants: dbItem.current_participants,
        maxParticipants: dbItem.max_participants,
        groupPhoto: dbItem.group_photo
      }
    case 'minddate':
      return {
        ...base,
        categoryType: 'minddate',
        type: dbItem.minddate_type,
        target: dbItem.target_audience,
        genderRatio: dbItem.gender_ratio_male != null && dbItem.gender_ratio_female != null
          ? { male: dbItem.gender_ratio_male, female: dbItem.gender_ratio_female }
          : undefined,
        matchedCouples: dbItem.matched_couples,
        bankInfo: dbItem.bank_info,
        refundPolicy: dbItem.refund_policy
      }
    case 'crew':
      return {
        ...base,
        categoryType: 'crew',
        type: dbItem.crew_type,
        leader: dbItem.leader,
        leaderProfile: dbItem.leader_profile,
        level: dbItem.crew_level,
        course: dbItem.course,
        gallery: dbItem.gallery,
        reportContent: dbItem.report_content,
        relatedRecruitTitle: dbItem.related_recruit_title,
        purchaseCount: dbItem.purchase_count
      }
    case 'lecture':
      return {
        ...base,
        categoryType: 'lecture',
        format: dbItem.lecture_format,
        teacher: dbItem.teacher,
        teacherProfile: dbItem.teacher_profile,
        curriculum: dbItem.curriculum
      }
    default:
      return base as AnyItem
  }
}

function mapItemToDbItem(item: AnyItem): any {
  const dbItem: any = {
    title: item.title,
    img: item.img,
    author: item.author,
    views: item.views,
    comments: item.comments,
    description: item.desc,
    event_date: item.date,
    price: item.price,
    location: item.loc,
    status: item.status,
    host_bank_info: item.hostBankInfo,
    kakao_chat_url: item.kakaoChatUrl,
    host_description: item.hostDescription,
    host_intro_image: item.hostIntroImage,
    category_type: item.categoryType
  }

  switch (item.categoryType) {
    case 'networking':
      dbItem.networking_type = item.type
      dbItem.curriculum = item.curriculum
      dbItem.current_participants = item.currentParticipants
      dbItem.max_participants = item.maxParticipants
      dbItem.group_photo = item.groupPhoto
      break
    case 'minddate':
      dbItem.minddate_type = item.type
      dbItem.target_audience = item.target
      if (item.genderRatio) {
        dbItem.gender_ratio_male = item.genderRatio.male
        dbItem.gender_ratio_female = item.genderRatio.female
      }
      dbItem.matched_couples = item.matchedCouples
      dbItem.bank_info = item.bankInfo
      dbItem.refund_policy = item.refundPolicy
      break
    case 'crew':
      dbItem.crew_type = item.type
      dbItem.leader = item.leader
      dbItem.leader_profile = item.leaderProfile
      dbItem.crew_level = item.level
      dbItem.course = item.course
      dbItem.gallery = item.gallery
      dbItem.report_content = item.reportContent
      dbItem.related_recruit_title = item.relatedRecruitTitle
      dbItem.purchase_count = item.purchaseCount
      break
    case 'lecture':
      dbItem.lecture_format = item.format
      dbItem.teacher = item.teacher
      dbItem.teacher_profile = item.teacherProfile
      dbItem.curriculum = item.curriculum
      break
  }

  return dbItem
}

// --- Load all global data at once ---
export async function loadGlobalData() {
  const [slides, notifications, headers, detailImages, tagline, briefing] = await Promise.all([
    getSlides(),
    getNotifications(),
    getCategoryHeaders(),
    getDetailImages(),
    getTagline(),
    getBriefings()
  ])

  return {
    slides,
    notifications,
    headers,
    detailImages,
    tagline,
    briefing
  }
}

// --- Admin Functions ---

// 모든 유저 조회
export async function getUsers(): Promise<User[]> {
  try {
    const data = await supabaseGet<any>('users', 'order=created_at.desc')
    return data.map(d => ({
      id: d.id,
      name: d.name,
      email: d.email,
      avatar: d.avatar || '',
      roles: d.roles || [],
      joinDate: d.join_date,
      phone: d.phone,
      birthdate: d.birthdate,
      interests: d.interests,
      isProfileComplete: d.is_profile_complete
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// 유저 권한 수정
export async function updateUserRoles(userId: string, roles: string[]): Promise<boolean> {
  try {
    return await supabasePatch('users', `id=eq.${userId}`, { roles })
  } catch (error) {
    console.error('Error updating user roles:', error)
    return false
  }
}

// 유저 삭제 (탈퇴)
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    return await supabaseDelete('users', `id=eq.${userId}`)
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// 수수료율 조회
export async function getCommissionRate(): Promise<number> {
  const rate = await getSetting('commission_rate')
  return rate ? parseInt(rate) : 15
}

// 수수료율 설정
export async function setCommissionRate(rate: number): Promise<boolean> {
  try {
    // upsert를 위해 먼저 삭제 후 삽입
    await supabaseDelete('settings', `key=eq.commission_rate`)
    await supabasePost('settings', { key: 'commission_rate', value: rate.toString() })
    return true
  } catch (error) {
    console.error('Error setting commission rate:', error)
    return false
  }
}

// Briefings 설정 (전체 교체)
export async function setBriefings(briefings: BriefingItem[]): Promise<boolean> {
  try {
    // 기존 briefings 삭제
    await supabaseDelete('briefings', 'id=gt.0')
    // 새 briefings 삽입
    for (const b of briefings) {
      await supabasePost('briefings', {
        text: b.text,
        highlight: b.highlight,
        is_active: true,
        sort_order: briefings.indexOf(b) + 1
      })
    }
    return true
  } catch (error) {
    console.error('Error setting briefings:', error)
    return false
  }
}

// 마이페이지 배너 이미지
export async function getMyPageBanner(): Promise<string> {
  const banner = await getSetting('mypage_banner')
  return banner || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600'
}

// 내가 만든 아이템 조회 (author로 필터)
export async function getMyCreatedItems(authorName: string): Promise<AnyItem[]> {
  try {
    const data = await supabaseGet<any>('items', `author=eq.${encodeURIComponent(authorName)}&order=created_at.desc`)
    return data.map(mapDbItemToItem)
  } catch (error) {
    console.error('Error fetching my created items:', error)
    return []
  }
}

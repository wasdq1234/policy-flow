import { sqliteTable, text, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// FEAT-0: 사용자 관리
// ============================================================================

/**
 * users - 사용자
 * 최소 수집 원칙: 필수(provider, provider_id), 선택(email, nickname, profile_image)
 */
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email'),
    provider: text('provider').notNull(), // 'google', 'kakao'
    providerId: text('provider_id').notNull(),
    nickname: text('nickname').notNull().default('익명'),
    profileImage: text('profile_image'),
    preferences: text('preferences'), // JSON: { regions: [], categories: [], ageRange: {} }
    fcmToken: text('fcm_token'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    providerIdx: uniqueIndex('idx_users_provider').on(table.provider, table.providerId),
  })
);

/**
 * auth_tokens - 인증 토큰 (리프레시 토큰)
 */
export const authTokens = sqliteTable(
  'auth_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshToken: text('refresh_token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index('idx_auth_tokens_user').on(table.userId),
    expiresIdx: index('idx_auth_tokens_expires').on(table.expiresAt),
  })
);

// ============================================================================
// FEAT-1: 정책 데이터
// ============================================================================

/**
 * policies - 정책 정보
 * ID: 외부 API bizId (R2023011234 형식)
 * 카테고리: JOB, HOUSING, LOAN, EDUCATION, STARTUP, WELFARE
 * 지역: SEOUL, BUSAN, ..., ALL
 */
export const policies = sqliteTable(
  'policies',
  {
    id: text('id').primaryKey(), // 외부 API bizId
    title: text('title').notNull(),
    summary: text('summary'),
    category: text('category').notNull(), // JOB, HOUSING, LOAN, EDUCATION, STARTUP, WELFARE
    region: text('region').notNull(), // SEOUL, BUSAN, ..., ALL
    targetAgeMin: integer('target_age_min'),
    targetAgeMax: integer('target_age_max'),
    startDate: integer('start_date', { mode: 'timestamp' }),
    endDate: integer('end_date', { mode: 'timestamp' }),
    isAlwaysOpen: integer('is_always_open', { mode: 'boolean' }).notNull().default(false),
    applyUrl: text('apply_url'),
    detailJson: text('detail_json'), // JSON: { content_html, eligibility, documents, contact, source_url }
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    filterIdx: index('idx_policies_filter').on(table.region, table.category),
    dateIdx: index('idx_policies_date').on(table.startDate, table.endDate),
    updatedIdx: index('idx_policies_updated').on(table.updatedAt),
  })
);

// ============================================================================
// FEAT-2: 북마크
// ============================================================================

/**
 * bookmarks - 사용자가 저장한 정책
 */
export const bookmarks = sqliteTable(
  'bookmarks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    policyId: text('policy_id')
      .notNull()
      .references(() => policies.id, { onDelete: 'cascade' }),
    notifyBeforeDays: integer('notify_before_days').notNull().default(3),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.policyId] }),
    userIdx: index('idx_bookmarks_user').on(table.userId, table.createdAt),
    policyIdx: index('idx_bookmarks_policy').on(table.policyId),
  })
);

// ============================================================================
// FEAT-3: 커뮤니티 (게시글, 댓글, 좋아요, 신고)
// ============================================================================

/**
 * posts - 게시글
 * 주의: user_id는 NULL 허용 (탈퇴 시 익명화)
 * post_type: tip, question, review, general
 */
export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    policyId: text('policy_id').references(() => policies.id, { onDelete: 'set null' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // NULL 허용
    nickname: text('nickname'),
    title: text('title').notNull(),
    content: text('content').notNull(),
    postType: text('post_type').notNull().default('general'), // tip, question, review, general
    viewCount: integer('view_count').notNull().default(0),
    likeCount: integer('like_count').notNull().default(0),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => ({
    policyIdx: index('idx_posts_policy').on(table.policyId, table.createdAt),
    typeIdx: index('idx_posts_type').on(table.postType, table.createdAt),
    userIdx: index('idx_posts_user').on(table.userId),
  })
);

/**
 * comments - 댓글 (대댓글 지원)
 * 주의: user_id는 NULL 허용 (탈퇴 시 익명화)
 */
export const comments: any = sqliteTable(
  'comments',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    parentId: integer('parent_id').references((): any => comments.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // NULL 허용
    nickname: text('nickname'),
    content: text('content').notNull(),
    likeCount: integer('like_count').notNull().default(0),
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    postIdx: index('idx_comments_post').on(table.postId, table.createdAt),
    parentIdx: index('idx_comments_parent').on(table.parentId),
    userIdx: index('idx_comments_user').on(table.userId),
  })
);

/**
 * post_likes - 게시글 좋아요
 */
export const postLikes = sqliteTable(
  'post_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postId: integer('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  })
);

/**
 * comment_likes - 댓글 좋아요
 */
export const commentLikes = sqliteTable(
  'comment_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: integer('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.commentId] }),
  })
);

/**
 * reports - 신고 (게시글/댓글)
 */
export const reports = sqliteTable(
  'reports',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    targetType: text('target_type').notNull(), // 'post', 'comment'
    targetId: integer('target_id').notNull(),
    reason: text('reason').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => ({
    targetIdx: index('idx_reports_target').on(table.targetType, table.targetId),
  })
);

// ============================================================================
// 내부 관리 (데이터 동기화)
// ============================================================================

/**
 * sync_status - 외부 API 동기화 상태 추적
 */
export const syncStatus = sqliteTable('sync_status', {
  source: text('source').primaryKey(), // 'youth_center', 'bizinfo', etc.
  lastPageIndex: integer('last_page_index').notNull().default(0),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }).notNull(),
});

// ============================================================================
// TypeScript 타입 추론
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;

export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type PostLike = typeof postLikes.$inferSelect;
export type NewPostLike = typeof postLikes.$inferInsert;

export type CommentLike = typeof commentLikes.$inferSelect;
export type NewCommentLike = typeof commentLikes.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type SyncStatus = typeof syncStatus.$inferSelect;
export type NewSyncStatus = typeof syncStatus.$inferInsert;

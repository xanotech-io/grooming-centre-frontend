// import { http } from "../http";

let MOCK_BADGES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Course Champion",
    description: "Awarded for completing 10 courses",
    imageUrl: "https://example.com/badge.png",
    category: "course_completion",
    criteria: { coursesCompleted: 10 },
    points: 100,
    isActive: true,
    expiryDays: null,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Perfect Score",
    description: "Awarded for achieving 100% on 5 assessments",
    imageUrl: "https://example.com/badge-perfect.png",
    category: "assessment_score",
    criteria: { perfectAssessments: 5 },
    points: 200,
    isActive: true,
    expiryDays: 365,
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Discussion Star",
    description: "Awarded for active participation in forums",
    imageUrl: "https://example.com/badge-participation.png",
    category: "participation",
    criteria: { postsCreated: 20 },
    points: 80,
    isActive: true,
    expiryDays: null,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
  },
];

let MOCK_USER_BADGES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    userId: "mock_student_1",
    badgeId: "550e8400-e29b-41d4-a716-446655440002",
    awardedAt: "2025-03-15T10:30:00Z",
    expiresAt: null,
    isRevoked: false,
    reason: "Automatic award",
    user: {
      firstName: "Nmorsi",
      lastName: "Donald",
      email: "donald@example.com",
      department: "Engineering",
    },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    userId: "mock_student_1",
    badgeId: "550e8400-e29b-41d4-a716-446655440003",
    awardedAt: "2025-03-20T12:00:00Z",
    expiresAt: "2026-03-20T12:00:00Z",
    isRevoked: false,
    reason: "Manual award for exceptional performance",
    user: {
      firstName: "Nmorsi",
      lastName: "Donald",
      email: "donald@example.com",
      department: "Engineering",
    },
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    userId: "LRN-002",
    badgeId: "550e8400-e29b-41d4-a716-446655440007",
    awardedAt: "2025-03-25T12:00:00Z",
    expiresAt: null,
    isRevoked: false,
    reason: "Participation milestone",
    user: {
      firstName: "Jane",
      lastName: "Okoro",
      email: "jane@example.com",
      department: "Engineering",
    },
  },
];

let MOCK_BADGE_PROGRESS = {
  mock_student_1: [
    {
      badgeId: "550e8400-e29b-41d4-a716-446655440002",
      badgeName: "Course Champion",
      progress: {
        coursesCompleted: 7,
        required: 10,
        percentage: 70,
      },
      status: "IN_PROGRESS",
    },
    {
      badgeId: "550e8400-e29b-41d4-a716-446655440003",
      badgeName: "Perfect Score",
      progress: {
        perfectAssessments: 2,
        required: 5,
        percentage: 40,
      },
      status: "IN_PROGRESS",
    },
  ],
  "LRN-002": [
    {
      badgeId: "550e8400-e29b-41d4-a716-446655440007",
      badgeName: "Discussion Star",
      progress: {
        postsCreated: 20,
        required: 20,
        percentage: 100,
      },
      status: "EARNED",
    },
  ],
};

const DEFAULT_USER_ID = "mock_student_1";

const paginate = (rows, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 10);
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    rows: rows.slice(start, end),
    count: rows.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
};

const getBadgeByIdInternal = (badgeId) =>
  MOCK_BADGES.find((badge) => badge.id === badgeId);

const mergeUserBadgeWithBadge = (userBadge) => ({
  ...userBadge,
  badge: getBadgeByIdInternal(userBadge.badgeId),
});

/**
 * TC13 - Get current user's badges
 * GET /v2/badges/my-badges
 */
export const userGetMyBadges = async (params = {}) => {
  const userId = params.userId || DEFAULT_USER_ID;

  const rows = MOCK_USER_BADGES.filter(
    (item) => item.userId === userId && !item.isRevoked,
  ).map(mergeUserBadgeWithBadge);

  const pagination = paginate(rows, params);

  return {
    rows: pagination.rows,
    count: pagination.count,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
};

/**
 * TC13 - Get current user's badge progress
 * GET /v2/badges/my-progress
 */
export const userGetMyBadgeProgress = async (params = {}) => {
  const userId = params.userId || DEFAULT_USER_ID;

  return {
    badgeProgress: MOCK_BADGE_PROGRESS[userId] || [],
  };
};

/**
 * TC13 - Get current user's rank
 * GET /v2/badges/my-rank
 */
export const userGetMyRank = async (params = {}) => {
  const userId = params.userId || DEFAULT_USER_ID;

  const pointsByUser = MOCK_USER_BADGES.filter((item) => !item.isRevoked).reduce(
    (acc, item) => {
      const badgePoints = getBadgeByIdInternal(item.badgeId)?.points || 0;
      acc[item.userId] = (acc[item.userId] || 0) + badgePoints;
      return acc;
    },
    {},
  );

  const ranked = Object.entries(pointsByUser)
    .map(([id, totalPoints]) => ({ userId: id, totalPoints }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const rankIndex = ranked.findIndex((item) => item.userId === userId);

  return {
    rank: rankIndex >= 0 ? rankIndex + 1 : ranked.length + 1,
    totalPoints: pointsByUser[userId] || 0,
    totalUsers: Math.max(ranked.length, 1),
  };
};

/**
 * TC13 - Get badge leaderboard
 * GET /v2/badges/leaderboard
 */
export const userGetBadgeLeaderboard = async (params = {}) => {
  const limit = Number(params.limit || 10);
  const departmentId = params.departmentId;

  const rows = Object.values(
    MOCK_USER_BADGES.filter((item) => !item.isRevoked).reduce((acc, item) => {
      const userName = `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim();
      const department = item.user?.department || "General";
      if (departmentId && department !== departmentId) {
        return acc;
      }

      if (!acc[item.userId]) {
        acc[item.userId] = {
          userId: item.userId,
          userName,
          department,
          totalPoints: 0,
          badgesEarned: 0,
        };
      }

      acc[item.userId].badgesEarned += 1;
      acc[item.userId].totalPoints += getBadgeByIdInternal(item.badgeId)?.points || 0;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    leaderboard: rows,
    totalParticipants: rows.length,
  };
};

/**
 * TC13 - Get all available badges
 * GET /v2/badges
 */
export const userGetAllBadges = async (params = {}) => {
  let rows = [...MOCK_BADGES];

  if (params.category) {
    rows = rows.filter((badge) => badge.category === params.category);
  }

  if (params.isActive != null && params.isActive !== "") {
    const normalizedActive =
      params.isActive === true || params.isActive === "true";
    rows = rows.filter((badge) => badge.isActive === normalizedActive);
  }

  const pagination = paginate(rows, params);

  return {
    rows: pagination.rows,
    count: pagination.count,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
};

/**
 * TC13 - Create new badge (Admin)
 * POST /v2/badges
 */
export const adminCreateBadge = async (body = {}) => {
  const created = {
    id: `badge-${Date.now()}`,
    name: body.name || "New Badge",
    description: body.description || "",
    imageUrl: body.imageUrl || "",
    category: body.category || "special",
    criteria: body.criteria || {},
    points: Number(body.points || 0),
    isActive: true,
    expiryDays: body.expiryDays ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_BADGES = [created, ...MOCK_BADGES];

  return {
    message: "Badge created successfully",
    badge: created,
  };
};

/**
 * TC13 - Get badge by id
 * GET /v2/badges/{id}
 */
export const userGetBadgeById = async (id) => {
  const badge = getBadgeByIdInternal(id);
  if (!badge) {
    throw new Error("Badge not found");
  }

  return { badge };
};

/**
 * TC13 - Update badge (Admin)
 * PUT /v2/badges/{id}
 */
export const adminUpdateBadge = async (id, body = {}) => {
  const existing = getBadgeByIdInternal(id);
  if (!existing) {
    throw new Error("Badge not found");
  }

  const updated = {
    ...existing,
    ...body,
    points: body.points != null ? Number(body.points) : existing.points,
    updatedAt: new Date().toISOString(),
  };

  MOCK_BADGES = MOCK_BADGES.map((badge) => (badge.id === id ? updated : badge));

  return {
    message: "Badge updated successfully",
    badge: updated,
  };
};

/**
 * TC13 - Delete badge (Admin)
 * DELETE /v2/badges/{id}
 */
export const adminDeleteBadge = async (id) => {
  const before = MOCK_BADGES.length;
  MOCK_BADGES = MOCK_BADGES.filter((badge) => badge.id !== id);

  if (MOCK_BADGES.length === before) {
    throw new Error("Badge not found");
  }

  return {
    message: "Badge deleted successfully",
  };
};

/**
 * TC13 - Get all user badges (Admin)
 * GET /v2/badges/user-badges
 */
export const adminGetAllUserBadges = async (params = {}) => {
  let rows = MOCK_USER_BADGES.filter((item) => !item.isRevoked).map(mergeUserBadgeWithBadge);

  if (params.userId) {
    rows = rows.filter((item) => item.userId === params.userId);
  }

  if (params.badgeId) {
    rows = rows.filter((item) => item.badgeId === params.badgeId);
  }

  const pagination = paginate(rows, params);

  return {
    rows: pagination.rows,
    count: pagination.count,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
  };
};

/**
 * TC13 - Award badge to user (Admin)
 * POST /v2/badges/award
 */
export const adminAwardBadgeToUser = async (body = {}) => {
  const exists = MOCK_USER_BADGES.some(
    (item) => item.userId === body.userId && item.badgeId === body.badgeId && !item.isRevoked,
  );

  if (exists) {
    throw new Error("User already has this badge");
  }

  const newUserBadge = {
    id: `user-badge-${Date.now()}`,
    userId: body.userId,
    badgeId: body.badgeId,
    awardedAt: new Date().toISOString(),
    expiresAt: null,
    isRevoked: false,
    reason: body.reason || "Manual award",
    user: body.user || {
      firstName: "Learner",
      lastName: body.userId || "",
      email: "learner@example.com",
      department: "General",
    },
  };

  MOCK_USER_BADGES = [newUserBadge, ...MOCK_USER_BADGES];

  return {
    message: "Badge awarded successfully",
    userBadge: newUserBadge,
  };
};

/**
 * TC13 - Revoke badge from user (Admin)
 * POST /v2/badges/revoke/{userBadgeId}
 */
export const adminRevokeBadgeFromUser = async (userBadgeId, body = {}) => {
  const existing = MOCK_USER_BADGES.find((item) => item.id === userBadgeId);
  if (!existing) {
    throw new Error("User badge not found");
  }

  MOCK_USER_BADGES = MOCK_USER_BADGES.map((item) =>
    item.id === userBadgeId
      ? { ...item, isRevoked: true, revokeReason: body.reason || "Revoked" }
      : item,
  );

  return {
    message: "Badge revoked successfully",
  };
};

/**
 * TC13 - Get user's badge progress (Admin)
 * GET /v2/badges/progress/{userId}
 */
export const adminGetBadgeProgressByUserId = async (userId) => {
  return {
    userId,
    badgeProgress: MOCK_BADGE_PROGRESS[userId] || [],
  };
};

/**
 * TC13 - Update user's badge progress (Admin)
 * POST /v2/badges/progress/{userId}
 */
export const adminUpdateBadgeProgressByUserId = async (userId, body = {}) => {
  const badgeId = body.badgeId;
  const patch = body.progress || {};

  const current = [...(MOCK_BADGE_PROGRESS[userId] || [])];
  const index = current.findIndex((item) => item.badgeId === badgeId);

  if (index === -1) {
    const badge = getBadgeByIdInternal(badgeId);
    current.push({
      badgeId,
      badgeName: badge?.name || "Badge",
      progress: {
        ...patch,
        required: patch.required || 1,
        percentage: patch.percentage || 0,
      },
      status: "IN_PROGRESS",
    });
  } else {
    const required = current[index].progress.required || patch.required || 1;
    const numericKeys = Object.keys(patch).filter((key) => typeof patch[key] === "number");
    const progressValue = numericKeys.length ? patch[numericKeys[0]] : null;
    const percentage =
      progressValue != null
        ? Math.min(100, Math.round((progressValue / required) * 100))
        : current[index].progress.percentage;

    current[index] = {
      ...current[index],
      progress: {
        ...current[index].progress,
        ...patch,
        required,
        percentage,
      },
      status: percentage >= 100 ? "EARNED" : "IN_PROGRESS",
    };
  }

  MOCK_BADGE_PROGRESS = {
    ...MOCK_BADGE_PROGRESS,
    [userId]: current,
  };

  return {
    message: "Progress updated successfully",
  };
};

/**
 * TC13 - Get badge statistics (Admin)
 * GET /v2/badges/admin/statistics
 */
export const adminGetBadgeStatistics = async () => {
  const awardedRows = MOCK_USER_BADGES.filter((item) => !item.isRevoked);

  const byCategory = awardedRows.reduce(
    (acc, item) => {
      const category = getBadgeByIdInternal(item.badgeId)?.category || "special";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {
      course_completion: 0,
      assessment_score: 0,
      participation: 0,
      time_based: 0,
      special: 0,
    },
  );

  const recentAwards = awardedRows
    .slice()
    .sort((a, b) => new Date(b.awardedAt) - new Date(a.awardedAt))
    .slice(0, 5)
    .map((award) => ({
      userId: award.userId,
      badgeName: getBadgeByIdInternal(award.badgeId)?.name || "Badge",
      awardedAt: award.awardedAt,
    }));

  return {
    totalBadges: MOCK_BADGES.length,
    totalAwarded: awardedRows.length,
    byCategory,
    recentAwards,
  };
};

/**
 * TC13 - Check and process expired badges (Admin)
 * POST /v2/badges/admin/check-expired
 */
export const adminCheckExpiredBadges = async () => {
  const now = new Date();
  let expiredCount = 0;

  MOCK_USER_BADGES = MOCK_USER_BADGES.map((item) => {
    if (item.isRevoked || !item.expiresAt) return item;
    if (new Date(item.expiresAt) < now) {
      expiredCount += 1;
      return {
        ...item,
        isRevoked: true,
        revokeReason: "Expired",
      };
    }
    return item;
  });

  return {
    message: "Expired badges processed successfully",
    data: {
      processedCount: MOCK_USER_BADGES.length,
      expiredCount,
    },
  };
};

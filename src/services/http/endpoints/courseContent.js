// import { http } from '../http';

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------

const MOCK_CONTENTS_LIST = [
  {
    contentId: "CNT-001",
    courseId: "CRS-AGR101",
    courseTitle: "Agriculture Fundamentals",
    title: "Introduction to Crop Science",
    editedBy: "Instructor-003",
    editDate: "2025-11-15T14:30:00Z",
    versionNumber: "v2.1",
    approvalStatus: "Approved",
    fileType: "HTML",
    publishStatus: "Published",
    lastSaved: "2025-11-15T14:30:00Z",
    mediaCount: 2,
    changeSummary: "Updated lesson text & images",
  },
  {
    contentId: "CNT-002",
    courseId: "CRS-CS101",
    courseTitle: "Customer Service Essentials",
    title: "Communication Fundamentals",
    editedBy: "Instructor-001",
    editDate: "2025-11-12T11:00:00Z",
    versionNumber: "v1.3",
    approvalStatus: "Pending",
    fileType: "HTML",
    publishStatus: "Draft",
    lastSaved: "2025-11-12T11:00:00Z",
    mediaCount: 1,
    changeSummary: "Initial draft",
  },
  {
    contentId: "CNT-003",
    courseId: "CRS-DL101",
    courseTitle: "Digital Literacy Program",
    title: "Internet Safety & Security",
    editedBy: "Instructor-002",
    editDate: "2025-11-10T09:30:00Z",
    versionNumber: "v1.0",
    approvalStatus: "Approved",
    fileType: "HTML",
    publishStatus: "Published",
    lastSaved: "2025-11-10T09:30:00Z",
    mediaCount: 0,
    changeSummary: "Published final version",
  },
];

// ---------------------------------------------------------------------------
// 0. List all course content items (across courses or per course)
// GET /api/v2/courses/{courseId}/content
// ---------------------------------------------------------------------------

/**
 * Get all course content records with optional courseId filter
 * @param {{ courseId?: string }} params
 * @returns {Promise<{ contents: Array, totalDocumentsCount: number }>}
 */
export const getCourseContents = async (params) => {
  // TODO: replace mock with real call
  // const base = params?.courseId ? `/v2/courses/${params.courseId}/content` : '/v2/courses/content';
  // const { data: { data } } = await http.get(base, { params });
  // return { contents: data.rows, totalDocumentsCount: data.count };

  const contents = params?.courseId
    ? MOCK_CONTENTS_LIST.filter((c) => c.courseId === params.courseId)
    : MOCK_CONTENTS_LIST;

  return { contents, totalDocumentsCount: contents.length };
};

// Draft.js raw JSON representing: "Introduction to Crop Science" with
// bold/italic inline styles and a bullet list — mirrors the API spec sample.
const MOCK_DRAFT_CONTENT = JSON.stringify({
  blocks: [
    {
      key: "blk1",
      text: "Introduction to Crop Science",
      type: "header-one",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
    {
      key: "blk2",
      text: "This course covers fundamental concepts of modern agriculture.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [
        { offset: 20, length: 11, style: "BOLD" },
        { offset: 38, length: 18, style: "ITALIC" },
      ],
      entityRanges: [],
      data: {},
    },
    {
      key: "blk3",
      text: "Soil Science",
      type: "unordered-list-item",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
    {
      key: "blk4",
      text: "Plant Biology",
      type: "unordered-list-item",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
  entityMap: {},
});

const MOCK_CONTENT = {
  contentId: "CNT-001",
  courseId: "CRS-AGR101",
  title: "Introduction to Crop Science",
  // draftContent: internal Draft.js JSON (used by the editor)
  draftContent: MOCK_DRAFT_CONTENT,
  // htmlContent: rendered HTML (matches API spec response field)
  htmlContent:
    "<h1>Welcome to Crop Science</h1><p>This course covers <strong>fundamental</strong> concepts of <em>modern agriculture</em>.</p><ul><li>Soil Science</li><li>Plant Biology</li></ul>",
  editedBy: "Instructor-003",
  editDate: "2025-11-15T14:30:00Z",
  versionNumber: "v2.1",
  approvalStatus: "Approved",
  fileType: "HTML",
  publishStatus: "Published",
  lastSaved: "2025-11-15T14:30:00Z",
  mediaCount: 2,
  mediaEmbedded: [
    {
      type: "image",
      url: "https://storage.example.com/images/soil_types.jpg",
      alt: "Soil Types Diagram",
    },
    {
      type: "video",
      url: "https://storage.example.com/videos/intro.mp4",
      duration: 300,
    },
  ],
  formattingApplied: {
    bold: true,
    italic: true,
    underline: false,
    lists: ["unordered"],
    headings: ["h1"],
    htmlTags: ["<h1>", "<p>", "<strong>", "<em>", "<ul>", "<li>"],
  },
  changeSummary: "Updated lesson text & images",
  lossOfFormattingFlag: false,
};

// ---------------------------------------------------------------------------
// 8.1 Get Course Content
// GET /api/v2/courses/{courseId}/content/{contentId}
// ---------------------------------------------------------------------------

/**
 * Retrieve a single piece of course content with formatting preserved
 * @param {string} courseId
 * @param {string} contentId
 * @returns {Promise<{ content: object }>}
 */
export const getCourseContent = async (courseId, contentId) => {
  // TODO: replace mock with real call
  // const { data: { data } } = await http.get(`/v2/courses/${courseId}/content/${contentId}`);
  // return { content: data };

  return { content: { ...MOCK_CONTENT, courseId, contentId } };
};

// ---------------------------------------------------------------------------
// 8.2 Create Course Content
// POST /api/v2/courses/{courseId}/content
// ---------------------------------------------------------------------------

/**
 * Create new content for a course
 * @param {string} courseId
 * @param {{ title: string, content: string, fileType: string, publishStatus: string, changeSummary?: string, mediaEmbedded?: Array }} body
 * @returns {Promise<{ message: string, content: object }>}
 */
export const createCourseContent = async (courseId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.post(`/v2/courses/${courseId}/content`, body);
  // return { message, content: data };

  const contentId = `CNT-${Date.now()}`;
  return {
    message: "Content created successfully",
    content: {
      ...MOCK_CONTENT,
      contentId,
      courseId,
      title: body.title,
      htmlContent: body.content,
      publishStatus: body.publishStatus || "Draft",
      fileType: body.fileType || "HTML",
      changeSummary: body.changeSummary || "",
      versionNumber: "v1.0",
      approvalStatus: "Pending",
      editDate: new Date().toISOString(),
      lastSaved: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// 8.3 Update Course Content
// PUT /api/v2/courses/{courseId}/content/{contentId}
// ---------------------------------------------------------------------------

/**
 * Update existing course content with rich text
 * @param {string} courseId
 * @param {string} contentId
 * @param {{ title: string, content: string, fileType: string, publishStatus: string, changeSummary?: string, mediaEmbedded?: Array }} body
 * @returns {Promise<{ message: string, content: object }>}
 */
export const updateCourseContent = async (courseId, contentId, body) => {
  // TODO: replace mock with real call
  // const { data: { message, data } } = await http.put(`/v2/courses/${courseId}/content/${contentId}`, body);
  // return { message, content: data };

  const versionParts = MOCK_CONTENT.versionNumber.replace("v", "").split(".");
  const newVersion = `v${versionParts[0]}.${parseInt(versionParts[1] || 0, 10) + 1}`;

  return {
    message: "Content updated successfully",
    content: {
      ...MOCK_CONTENT,
      contentId,
      courseId,
      title: body.title,
      htmlContent: body.content,
      publishStatus: body.publishStatus || MOCK_CONTENT.publishStatus,
      fileType: body.fileType || "HTML",
      changeSummary: body.changeSummary || "",
      versionNumber: newVersion,
      approvalStatus: "Pending",
      editDate: new Date().toISOString(),
      lastSaved: new Date().toISOString(),
    },
  };
};

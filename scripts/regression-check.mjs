import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";

const env = await readFile(".env", "utf8");

env.split(/\r?\n/).forEach((line) => {
  const separator = line.indexOf("=");

  if (separator < 1) {
    return;
  }

  const key = line.slice(0, separator).trim();
  const value = line
    .slice(separator + 1)
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2");

  process.env[key] ??= value;
});

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error("MONGODB_URI and JWT_SECRET are required");
}

const baseUrl = process.argv[2] ?? "http://localhost:3100";
const accessCookie = "fyp_accesstoken";
const refreshCookie = "fyp_refreshtoken";

function signToken(user, tokenType) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      status: user.status,
      tokenType,
    },
    process.env.JWT_SECRET,
    { expiresIn: tokenType === "access" ? "15m" : "7d" },
  );
}

function cookieFor(user, tokenType = "access") {
  const name = tokenType === "access" ? accessCookie : refreshCookie;

  return `${name}=${signToken(user, tokenType)}`;
}

async function request(path, cookie, init = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      cookie,
    },
  });
}

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB ?? "fyp_evaluator",
});

const users = mongoose.connection.collection("users");
const projects = mongoose.connection.collection("projects");
const phases = mongoose.connection.collection("evaluationphases");
const evaluations = mongoose.connection.collection("evaluations");
const admin = await users.findOne({ role: "admin", status: "active" });
const faculty = await users.findOne({ role: "faculty", status: "active" });
const phaseDocuments = await phases.find().sort({ order: 1 }).limit(2).toArray();
const totalPhaseCount = await phases.countDocuments();
const existingPendingProjects = await projects.countDocuments({
  deletionPending: true,
});

assert(admin, "An active admin is required");
assert(faculty, "An active faculty member is required");
assert.equal(phaseDocuments.length, 2, "At least two phases are required");
assert.equal(
  existingPendingProjects,
  0,
  "Regression aborted because real projects are pending deletion",
);

const runId = new Types.ObjectId().toString();
const projectId = new Types.ObjectId();
const orphanProjectId = new Types.ObjectId();
const inactiveUserId = new Types.ObjectId();
const studentIds = Array.from(
  { length: 3 },
  () => new Types.ObjectId().toString(),
);
const students = ["Regression Student A", "Regression Student B", "Regression Student C"];
const project = {
  _id: projectId,
  projectKey: `regression::${runId}`,
  title: `Regression ${runId}`,
  students,
  studentIds,
  supervisor: "Regression Supervisor",
  coSupervisor: "",
  industrialPartner: "Regression Partner",
  sdg: "SDG 4",
  status: "in progress",
  createdAt: new Date(),
  updatedAt: new Date(),
};
const inactiveUser = {
  _id: inactiveUserId,
  email: `inactive-${runId}@example.com`,
  fullName: "Inactive Regression User",
  gender: "",
  role: "faculty",
  status: "inactive",
  passwordHash: "not-used",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function payloadFor(phase, studentIndex) {
  return {
    phases: [
      {
        phaseId: phase._id.toString(),
        students: [
          {
            studentId: studentIds[studentIndex],
            studentName: students[studentIndex],
            evaluations: phase.plos.map((ploId) => ({
              ploId: ploId.toString(),
              obtainedMarks: 4,
            })),
            totalMarks: phase.plos.length * 4,
          },
        ],
      },
    ],
  };
}

const facultyCookie = cookieFor(faculty);
const adminCookie = cookieFor(admin);

try {
  const [loginPage, protectedPage, protectedApi] = await Promise.all([
    fetch(`${baseUrl}/login`),
    fetch(`${baseUrl}/dashboard`, { redirect: "manual" }),
    fetch(`${baseUrl}/api/faculty/me`, { method: "PATCH" }),
  ]);

  assert.equal(loginPage.status, 200, "Login page should render");
  assert.equal(protectedPage.status, 307, "Protected pages should redirect");
  assert.equal(
    protectedPage.headers.get("location"),
    "/login",
    "Protected pages should redirect to login",
  );
  assert.equal(protectedApi.status, 401, "Protected APIs should reject guests");

  await Promise.all([
    projects.insertOne(project),
    users.insertOne(inactiveUser),
  ]);

  const saveStudent = (studentIndex) =>
    request(
      `/api/faculty/projects/${projectId}/evaluations`,
      facultyCookie,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadFor(phaseDocuments[0], studentIndex)),
      },
    );
  const concurrentResponses = await Promise.all([
    saveStudent(0),
    saveStudent(1),
  ]);
  const concurrentStatuses = concurrentResponses.map(
    (response) => response.status,
  );

  if (concurrentStatuses.some((status) => status !== 201)) {
    const errors = await Promise.all(
      concurrentResponses.map((response) => response.clone().text()),
    );

    throw new Error(
      `Concurrent student saves failed: ${concurrentStatuses.join(", ")} ${errors.join(" | ")}`,
    );
  }

  const savedEvaluation = await evaluations.findOne({
    projectId,
    facultyId: faculty._id,
    phaseId: phaseDocuments[0]._id,
  });

  assert.equal(
    savedEvaluation?.students.length,
    2,
    "Concurrent saves must keep both students",
  );

  const duplicateResponse = await saveStudent(0);
  assert.equal(duplicateResponse.status, 400, "Saved marks must be immutable");

  const skippedPhaseResponse = await request(
    `/api/faculty/projects/${projectId}/evaluations`,
    facultyCookie,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payloadFor(phaseDocuments[1], 2)),
    },
  );
  assert.equal(
    skippedPhaseResponse.status,
    400,
    "A student must not skip earlier phases",
  );

  const forgedPayload = payloadFor(phaseDocuments[0], 2);
  forgedPayload.phases[0].students[0].studentId = new Types.ObjectId().toString();
  const forgedStudentResponse = await request(
    `/api/faculty/projects/${projectId}/evaluations`,
    facultyCookie,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(forgedPayload),
    },
  );
  assert.equal(
    forgedStudentResponse.status,
    400,
    "A student outside the project must be rejected",
  );

  const missingProjectResponse = await request(
    `/api/faculty/projects/${new Types.ObjectId()}/evaluations`,
    facultyCookie,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payloadFor(phaseDocuments[0], 2)),
    },
  );
  assert.equal(
    missingProjectResponse.status,
    400,
    "A nonexistent project must be rejected",
  );

  const editResponse = await request(
    `/api/admin/projects/${projectId}`,
    adminCookie,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...project,
        students: ["Renamed Student", students[2], "Added Student"],
        studentIds: [studentIds[0], studentIds[2], ""],
      }),
    },
  );
  assert.equal(editResponse.status, 200, "The project roster should update");
  const editResult = await editResponse.json();
  const addedStudentId = editResult.project.studentIds[2];

  assert.equal(
    editResult.project.studentIds[0],
    studentIds[0],
    "Renaming must preserve the stable student id",
  );
  assert(
    !studentIds.includes(addedStudentId),
    "An added student must receive a new stable id",
  );

  const evaluationAfterRosterUpdate = await evaluations.findOne({
    projectId,
    facultyId: faculty._id,
    phaseId: phaseDocuments[0]._id,
  });

  assert.deepEqual(
    evaluationAfterRosterUpdate?.students.map((student) => ({
      id: student.studentId,
      name: student.studentName,
    })),
    [{ id: studentIds[0], name: "Renamed Student" }],
    "Removed students must lose their evaluations while renamed students keep theirs",
  );
  assert.equal(
    await evaluations.countDocuments({
      projectId,
      "students.studentId": addedStudentId,
    }),
    0,
    "An added student must start without evaluations",
  );

  const projectsPageResponse = await request("/projects", facultyCookie);
  const projectsPageHtml = await projectsPageResponse.text();
  const projectRowStart = projectsPageHtml.indexOf(project.title);
  const expectedProgress = Math.round((1 / (3 * totalPhaseCount)) * 100);

  assert(projectRowStart >= 0, "Updated project should remain visible to faculty");
  assert(
    projectsPageHtml
      .slice(projectRowStart, projectRowStart + 5000)
      .includes(`${expectedProgress}%`),
    "Adding a student must recalculate project evaluation progress",
  );

  const inactiveAccessResponse = await request(
    "/api/me",
    cookieFor(inactiveUser),
  );
  assert.equal(
    inactiveAccessResponse.status,
    401,
    "Inactive access tokens must be rejected",
  );

  const inactiveRefreshResponse = await request(
    "/api/me",
    cookieFor(inactiveUser, "refresh"),
  );
  assert.equal(
    inactiveRefreshResponse.status,
    401,
    "Inactive refresh tokens must be rejected",
  );

  const deleteResponse = await request(
    `/api/admin/projects/${projectId}`,
    adminCookie,
    { method: "DELETE" },
  );
  assert.equal(deleteResponse.status, 200, "Project deletion should succeed");
  assert.equal(
    await evaluations.countDocuments({ projectId }),
    0,
    "Project deletion must remove its evaluations",
  );

  await projects.insertOne({
    ...project,
    _id: orphanProjectId,
    projectKey: `pending::${runId}`,
    deletionPending: true,
  });
  await evaluations.insertOne({
    projectId: orphanProjectId,
    facultyId: faculty._id,
    phaseId: phaseDocuments[0]._id,
    students: [],
    submittedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const pendingFacultyResponse = await request(
    `/projects/${orphanProjectId}`,
    facultyCookie,
  );
  assert.equal(
    pendingFacultyResponse.status,
    404,
    "Projects pending deletion must be hidden from faculty",
  );
  const pendingAdminResponse = await request("/admin/projects", adminCookie);
  assert.equal(
    pendingAdminResponse.status,
    200,
    "Refreshing admin projects should process pending deletion",
  );
  assert.equal(
    await evaluations.countDocuments({ projectId: orphanProjectId }),
    0,
    "Refreshing must clean pending project evaluations",
  );
  assert.equal(
    await projects.countDocuments({ _id: orphanProjectId }),
    0,
    "Refreshing must remove the pending project",
  );

  console.log("Regression checks passed.");
} finally {
  await Promise.all([
    projects.deleteMany({ _id: { $in: [projectId, orphanProjectId] } }),
    evaluations.deleteMany({
      projectId: { $in: [projectId, orphanProjectId] },
    }),
    users.deleteOne({ _id: inactiveUserId }),
  ]);
  await mongoose.disconnect();
}

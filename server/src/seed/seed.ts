import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Department from "../models/Department";
import Faculty from "../models/Faculty";
import Subject from "../models/Subject";
import Feedback from "../models/Feedback";
import Setting from "../models/Setting";

const departmentsData = [
  { name: "Computer Engineering", code: "COMP" },
  { name: "Information Technology", code: "IT" },
  { name: "Electronics & Telecommunication", code: "EXTC" },
  { name: "Mechanical Engineering", code: "MECH" },
];

const facultyData = {
  COMP: [
    { name: "Dr. Priya Sharma", email: "priya.sharma@college.edu", designation: "Professor" },
    { name: "Prof. Rajesh Kumar", email: "rajesh.kumar@college.edu", designation: "Associate Professor" },
    { name: "Dr. Anjali Patel", email: "anjali.patel@college.edu", designation: "Assistant Professor" },
  ],
  IT: [
    { name: "Dr. Suresh Reddy", email: "suresh.reddy@college.edu", designation: "Professor" },
    { name: "Prof. Meera Iyer", email: "meera.iyer@college.edu", designation: "Associate Professor" },
    { name: "Dr. Vikram Singh", email: "vikram.singh@college.edu", designation: "Assistant Professor" },
  ],
  EXTC: [
    { name: "Dr. Kavita Nair", email: "kavita.nair@college.edu", designation: "Professor" },
    { name: "Prof. Arjun Desai", email: "arjun.desai@college.edu", designation: "Associate Professor" },
    { name: "Dr. Sunita Rao", email: "sunita.rao@college.edu", designation: "Assistant Professor" },
  ],
  MECH: [
    { name: "Dr. Ramesh Gupta", email: "ramesh.gupta@college.edu", designation: "Professor" },
    { name: "Prof. Deepa Joshi", email: "deepa.joshi@college.edu", designation: "Associate Professor" },
    { name: "Dr. Manoj Verma", email: "manoj.verma@college.edu", designation: "Assistant Professor" },
  ],
};

const subjectsData = {
  COMP: [
    { name: "Data Structures", code: "CS201", semester: 3 },
    { name: "Database Systems", code: "CS301", semester: 5 },
    { name: "Machine Learning", code: "CS401", semester: 7 },
  ],
  IT: [
    { name: "Web Technologies", code: "IT201", semester: 3 },
    { name: "Cloud Computing", code: "IT301", semester: 5 },
    { name: "Cyber Security", code: "IT401", semester: 7 },
  ],
  EXTC: [
    { name: "Digital Electronics", code: "EX201", semester: 3 },
    { name: "Signal Processing", code: "EX301", semester: 5 },
    { name: "VLSI Design", code: "EX401", semester: 7 },
  ],
  MECH: [
    { name: "Thermodynamics", code: "ME201", semester: 3 },
    { name: "Fluid Mechanics", code: "ME301", semester: 5 },
    { name: "CAD/CAM", code: "ME401", semester: 7 },
  ],
};

const studentNames = [
  "Aarav Patel", "Aditi Shah", "Arjun Mehta", "Diya Desai", "Ishaan Joshi",
  "Kavya Reddy", "Krishna Nair", "Meera Iyer", "Neha Gupta", "Pranav Kumar",
  "Riya Sharma", "Rohan Verma", "Sanjana Singh", "Tanvi Patel", "Vedant Joshi",
  "Aisha Khan", "Dev Shah", "Nisha Mehta", "Om Patel", "Priya Desai"
];

const commentTemplates = {
  appreciation: [
    "Excellent teaching methodology, concepts are explained very clearly.",
    "Very supportive and approachable faculty, always ready to help.",
    "Great practical knowledge sharing, real-world examples used.",
    "Well-structured lectures with good pacing and clarity.",
    "Faculty makes complex topics easy to understand.",
  ],
  complaint: [
    "Lectures are often delayed and syllabus not completed on time.",
    "Poor internet connectivity in labs affects practical sessions.",
    "Laboratory equipment is outdated and not maintained properly.",
    "Teaching pace is too fast, difficult to follow concepts.",
    "Insufficient practical sessions, mostly theory only.",
  ],
  suggestion: [
    "More hands-on practical sessions would be beneficial.",
    "Please provide recorded lectures for revision.",
    "Additional reference materials would help understanding.",
    "More industry-relevant examples in lectures.",
    "Regular doubt-solving sessions would be great.",
  ],
};

const tagsList = ["Late Lectures", "Poor Internet", "Dirty Labs", "Too Fast", "No Practicals", "Great Teaching"];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Faculty.deleteMany({}),
      Subject.deleteMany({}),
      Feedback.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    console.log("Cleared all collections");

    // Create Setting singleton
    const setting = await Setting.create({
      key: "main",
      feedbackOpen: true,
      currentCycle: "2026-ODD",
      tags: tagsList,
    });
    console.log("Created settings");

    // Create departments
    const departments = await Department.insertMany(departmentsData);
    console.log(`Created ${departments.length} departments`);

    // Create faculty
    const facultyMap = new Map<string, any[]>();
    for (const dept of departments) {
      const deptCode = dept.code;
      const facultyList = facultyData[deptCode as keyof typeof facultyData] || [];
      const created = await Faculty.insertMany(
        facultyList.map((f) => ({ ...f, department: dept._id }))
      );
      facultyMap.set(deptCode, created);
    }
    console.log("Created faculty for all departments");

    // Create subjects
    const subjectMap = new Map<string, any[]>();
    for (const dept of departments) {
      const deptCode = dept.code;
      const subjectsList = subjectsData[deptCode as keyof typeof subjectsData] || [];
      const deptFaculty = facultyMap.get(deptCode) || [];
      const created = await Subject.insertMany(
        subjectsList.map((s, i) => ({
          ...s,
          department: dept._id,
          faculty: deptFaculty[i % deptFaculty.length]._id,
        }))
      );
      subjectMap.set(deptCode, created);
    }
    console.log("Created subjects for all departments");

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 12);
    const admin = await User.create({
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL || "admin@college.edu",
      password: adminPassword,
      role: "admin",
      isActive: true,
    });
    console.log(`Created admin: ${admin.email}`);

    // Create students
    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const dept = departments[i % departments.length];
      const rollNo = `${dept.code}${String(i + 1).padStart(3, "0")}`;
      const password = await bcrypt.hash(i === 0 ? "Student@123" : "Student@123", 12);
      const student = await User.create({
        name: studentNames[i],
        email: `${studentNames[i].toLowerCase().replace(" ", ".")}@college.edu`,
        rollNo,
        department: dept._id,
        password,
        role: "student",
        isActive: true,
      });
      students.push(student);
    }
    console.log(`Created ${students.length} students`);

    // Create feedback (~120 teaching feedback rows)
    const feedbackTypes: Array<"appreciation" | "complaint" | "suggestion"> = ["appreciation", "complaint", "suggestion"];
    const categories: Array<"teaching" | "classroom" | "laboratory" | "other"> = ["teaching", "classroom", "laboratory", "other"];
    const statuses: Array<"pending" | "in_review" | "resolved" | "rejected"> = ["pending", "in_review", "resolved", "rejected"];

    const feedbacks = [];
    const usedPairs = new Set<string>();

    for (let i = 0; i < 120; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const deptCode = dept.code;
      const deptSubjects = subjectMap.get(deptCode) || [];
      const deptFaculty = facultyMap.get(deptCode) || [];

      if (deptSubjects.length === 0 || deptFaculty.length === 0) continue;

      const subject = deptSubjects[Math.floor(Math.random() * deptSubjects.length)];
      const faculty = deptFaculty[Math.floor(Math.random() * deptFaculty.length)];
      const type = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)];
      const category = "teaching";
      const isAnonymous = Math.random() < 0.4;

      const pairKey = `${student._id}-${faculty._id}-${subject._id}-${setting.currentCycle}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      const rating = type === "appreciation" ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 3) + 1;
      const comment = commentTemplates[type][Math.floor(Math.random() * commentTemplates[type].length)];
      const tags = tagsList.slice(0, Math.floor(Math.random() * 3) + 1);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = Math.random() < 0.15;
      const daysAgo = Math.floor(Math.random() * 150);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const fb = await Feedback.create({
        student: student._id,
        department: dept._id,
        subject: subject._id,
        faculty: faculty._id,
        category,
        type,
        rating,
        tags,
        comment,
        isAnonymous,
        status,
        priority,
        cycle: setting.currentCycle,
        replies: status !== "pending" ? [{ admin: admin._id, message: "Thank you for your feedback. We will look into this." }] : [],
      });
      feedbacks.push(fb);
    }
    console.log(`Created ${feedbacks.length} feedback entries`);

    // Log credentials
    console.log("\n=== SEED COMPLETE ===");
    console.log("Admin login:");
    console.log(`  Email: ${process.env.ADMIN_EMAIL || "admin@college.edu"}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
    console.log("\nStudent login (first student):");
    console.log(`  Email: ${students[0].email}`);
    console.log(`  Password: Student@123`);
    console.log(`  Roll No: ${students[0].rollNo}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
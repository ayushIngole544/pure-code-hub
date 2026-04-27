import prisma from "../config/prisma";

// ==========================================
// 🧩 BASIC CREATE (DRAFT)
// ==========================================
export const createAssignment = async (
  data: any,
  teacherId: string
) => {
  const { title, dueDate } = data;

  return await prisma.assignment.create({
    data: {
      title,
      teacherId,
      dueDate: new Date(dueDate || new Date()),
      isPublished: false,
    },
  });
};

// ==========================================
// 🧠 CREATE OR UPDATE FULL ASSIGNMENT
// ==========================================
export const createAssignmentFull = async (
  data: any,
  teacherId: string
) => {
  const { id, title, dueDate, questions } = data;

  return await prisma.$transaction(async (tx) => {
    let assignment;

    // =========================
    // 🔁 UPDATE FLOW
    // =========================
    if (id) {
      // delete old questions
      await tx.question.deleteMany({
        where: { assignmentId: id },
      });

      // delete old problem links
      await tx.assignmentProblem.deleteMany({
        where: { assignmentId: id },
      });

      // update assignment
      assignment = await tx.assignment.update({
        where: { id },
        data: {
          title,
          dueDate: new Date(dueDate || new Date()),
        },
      });
    }

    // =========================
    // 🆕 CREATE FLOW
    // =========================
    else {
      assignment = await tx.assignment.create({
        data: {
          title,
          teacherId,
          dueDate: new Date(dueDate || new Date()),
          isPublished: false,
        },
      });
    }

    // =========================
    // 🧩 CREATE QUESTIONS
    // =========================
    for (const q of questions) {
      let problemId = q.problemId;

      // CODING QUESTION
      if (q.type === "CODING" && !problemId) {
        const problem = await tx.problem.create({
          data: {
            title: q.title,
            description: q.description,
            difficulty: (q.difficulty || "medium").toUpperCase(),
            createdBy: teacherId,
            testCases: {
              create:
                q.testCases?.map((tc: any) => ({
                  input: tc.input,
                  expectedOutput:
                    tc.expectedOutput || tc.output || "",
                  isHidden: tc.isHidden || false,
                })) || [],
            },
          },
        });

        problemId = problem.id;

        await tx.assignmentProblem.create({
          data: {
            assignmentId: assignment.id,
            problemId,
          },
        });
      }

      // CREATE QUESTION
      await tx.question.create({
        data: {
          assignmentId: assignment.id,
          type: q.type,
          title: q.title,
          description: q.description,
          options: q.type === "MCQ" ? q.options : null,
          correctAnswer:
            q.type !== "CODING"
              ? String(q.correctAnswer)
              : null,
          problemId: problemId || null,
          marks: q.marks ? parseInt(q.marks) : 10,
        },
      });
    }

    return assignment;
  });
};

// ==========================================
// 🚀 PUBLISH
// ==========================================
export const publishAssignment = async (id: string) => {
  return await prisma.assignment.update({
    where: { id },
    data: {
      isPublished: true,
    },
  });
};

// ==========================================
// 📚 GET ALL (STUDENT)
// ==========================================
export const getAllAssignments = async (user?: any) => {
  // 🔥 If teacher → return ALL
  if (user?.role === "TEACHER") {
    return await prisma.assignment.findMany({
      where: {
        teacherId: user.userId,
      },
      include: {
        questions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // 🔥 If student → ONLY published
  return await prisma.assignment.findMany({
    where: { isPublished: true },
    include: {
      questions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
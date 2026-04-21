import prisma from "../config/prisma";

// 🧩 Create Assignment WITH QUESTIONS (FIXED)
export const createAssignment = async (
  data: any,
  teacherId: string
) => {
  const {
    title,
    description,
    difficulty,
    language,
    questions,
  } = data;

  // 🔥 1. CREATE PROBLEMS FROM QUESTIONS
  const createdProblems = [];

  for (const q of questions) {
    const problem = await prisma.problem.create({
      data: {
        title: q.title,
        description: q.description,
        difficulty,
        createdBy: teacherId,

        testCases: {
          create: q.test_cases?.map((tc: any) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
          })) || [],
        },
      },
    });

    createdProblems.push(problem);
  }

  // 🔥 2. CREATE ASSIGNMENT + LINK PROBLEMS
  const assignment = await prisma.assignment.create({
    data: {
      title,
      teacherId,
      dueDate: new Date(), // fallback
      problems: {
        create: createdProblems.map((p) => ({
          problemId: p.id,
        })),
      },
    },
    include: {
      problems: {
        include: {
          problem: {
            include: {
              testCases: true,
            },
          },
        },
      },
    },
  });

  return assignment;
};

// 🧩 CREATE FULL ASSIGNMENT WITH NEW QUESTION SYSTEM
export const createAssignmentFull = async (data: any, teacherId: string) => {
  const { title, dueDate, questions } = data;

  return await prisma.$transaction(async (tx) => {
    // Create the assignment first
    const assignment = await tx.assignment.create({
      data: {
        title,
        teacherId,
        dueDate: new Date(dueDate || new Date()),
        isPublished: false,
      },
    });

    for (const q of questions) {
      let problemId = q.problemId;

      // If it's a coding question without problemId but has testCases, create a Problem
      if (q.type === "CODING" && !problemId) {
        const problem = await tx.problem.create({
          data: {
            title: q.title,
            description: q.description,
            difficulty: q.difficulty || "medium",
            createdBy: teacherId,
            testCases: {
              create: q.testCases?.map((tc: any) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden || false,
              })) || [],
            },
          },
        });
        problemId = problem.id;

        // Also link it to the assignment problems list (legacy support)
        await tx.assignmentProblem.create({
          data: {
            assignmentId: assignment.id,
            problemId: problem.id,
          },
        });
      }

      await tx.question.create({
        data: {
          assignmentId: assignment.id,
          type: q.type,
          title: q.title,
          description: q.description,
          options: q.type === "MCQ" ? q.options : null,
          correctAnswer: q.type !== "CODING" ? String(q.correctAnswer) : null,
          problemId: problemId || null,
          marks: q.marks ? parseInt(q.marks) : 10,
        },
      });
    }

    return assignment;
  });
};

// 🧩 PUBLISH ASSIGNMENT
export const publishAssignment = async (assignmentId: string) => {
  const assignment = await prisma.assignment.update({
    where: { id: assignmentId },
    data: { isPublished: true },
  });

  // Notify students if needed, or create a simple notification logic
  // For now, since students are assigned later or all students, let's just log or notify all users in a specific role if your app assigns everyone.
  
  // E.g., if there are specific students:
  const assignedStudents = await prisma.assignmentStudent.findMany({
    where: { assignmentId }
  });

  if (assignedStudents.length > 0) {
    await prisma.notification.createMany({
      data: assignedStudents.map(student => ({
        userId: student.studentId,
        message: `New Assignment Published: ${assignment.title}`,
      }))
    });
  } else {
    // if students can self-enroll, maybe globally notify? We'll leave it as is or notify generic.
  }

  return assignment;
};


// 📚 Get ALL assignments (for students + teacher)
export const getAllAssignments = async () => {
  return await prisma.assignment.findMany({
    include: {
      questions: true,
      problems: {
        include: {
          problem: {
            include: {
              testCases: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// 📚 Get assignments (for teacher only)
export const getTeacherAssignments = async (teacherId: string) => {
  return await prisma.assignment.findMany({
    where: { teacherId },
    include: {
      questions: true,
      problems: {
        include: {
          problem: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
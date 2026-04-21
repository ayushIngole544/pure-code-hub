import prisma from "../config/prisma";

// Assign students to assignment
export const assignStudents = async (
  assignmentId: string,
  studentIds: string[]
) => {
  const data = studentIds.map((studentId) => ({
    assignmentId,
    studentId,
  }));

  return await prisma.assignmentStudent.createMany({
    data,
    skipDuplicates: true,
  });
};

// Get assignments for student
export const getStudentAssignments = async (studentId: string) => {
  return await prisma.assignmentStudent.findMany({
    where: { studentId },
    include: {
      assignment: {
        include: {
          problems: true,
        },
      },
    },
  });
};
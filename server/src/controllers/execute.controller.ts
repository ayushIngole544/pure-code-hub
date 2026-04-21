import { Request, Response } from "express";
import { runCode } from "../services/execute.service";

export const executeCode = async (req: Request, res: Response) => {
  try {
    const { code, language, input } = req.body;

    console.log("EXECUTE HIT:", { code, language, input });

    if (!code || !language) {
      return res.status(400).json({
        message: "Code and language are required",
      });
    }

    const result = await runCode(code, language, input);

    console.log("EXECUTION RESULT:", result);

    return res.status(200).json({
      success: true,
      output: result.output || "",
      error: result.error || null,
    });

  } catch (error: any) {
    console.error("EXECUTION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
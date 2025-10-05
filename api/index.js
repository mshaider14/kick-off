import { createRequestHandler } from "@react-router/node";
import { installGlobals } from "@react-router/node";

installGlobals();

export default async function handler(req, res) {
  try {
    console.log("Handler invoked:", req.method, req.url);
    
    // Check if build exists
    let build;
    try {
      build = await import("../build/server/index.js");
      console.log("Build loaded successfully");
    } catch (buildError) {
      console.error("Failed to load build:", buildError);
      return res.status(500).json({ 
        error: "Build not found",
        message: buildError.message,
        stack: buildError.stack 
      });
    }

    const requestHandler = createRequestHandler({
      build,
      mode: process.env.NODE_ENV || "production",
    });

    return await requestHandler(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}
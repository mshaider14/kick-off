import { createRequestHandler } from "@react-router/node";
import { installGlobals } from "@react-router/node";

installGlobals();

export default async function handler(req, res) {
  try {
    const build = await import("../build/server/index.js");
    const requestHandler = createRequestHandler({ 
      build, 
      mode: process.env.NODE_ENV || "production" 
    });
    return requestHandler(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
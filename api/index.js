import { createRequestHandler } from "@react-router/node";
import { installGlobals } from "@react-router/node";

installGlobals();

export default async function handler(req, res) {
  const build = await import("../build/server/index.js");
  const requestHandler = createRequestHandler({ build, mode: "production" });
  return requestHandler(req, res);
}
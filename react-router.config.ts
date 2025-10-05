import type { Config } from "@react-router/dev/config";

export default {
  // App directory
  appDirectory: "app",
  
  // Server build directory
  buildDirectory: "build",
  
  // Server build file
  serverBuildFile: "index.js",
  
  // Public path property removed as it is not valid in ReactRouterConfig
  
  // Future flags
  future: {},
} satisfies Config;
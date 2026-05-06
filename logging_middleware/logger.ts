type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";
type SharedPackage = "auth" | "config" | "middleware" | "utils";
type LogPackage = FrontendPackage | SharedPackage;

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export const Log = async (
  token: string,
  endpoint: string,
  stack: "frontend" | "backend",
  level: LogLevel,
  pkg: LogPackage,
  message: string,
) => {
  if (!token || !endpoint) {
    console.error("Logging configuration missing (URL or Token).");
    return;
  }

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    if (!result.ok) {
      console.warn(`Log sync failed: ${result.status}`);
    }
  } catch (err) {
    console.error("Logger network error:", err);
  }
};

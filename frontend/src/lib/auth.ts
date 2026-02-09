// JWT token utilities
export function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function setToken(token: string): void {
  localStorage.setItem("accessToken", token);
}

export function removeToken(): void {
  localStorage.removeItem("accessToken");
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired
  try {
    const payload = parseJwt(token);
    if (payload.exp && (payload.exp as number) * 1000 < Date.now()) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Decode JWT token payload
function parseJwt(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

// Get user info from token
export function getUserFromToken(): {
  userId: string;
  email: string;
  role: "ADMIN" | "AUDITOR" | "USER";
  name?: string;
} | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = parseJwt(token);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: (payload.role as "ADMIN" | "AUDITOR" | "USER") || "USER",
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export function getUserRole(): "ADMIN" | "AUDITOR" | "USER" | null {
  const user = getUserFromToken();
  return user?.role || null;
}

export function isAdmin(): boolean {
  return getUserRole() === "ADMIN";
}

export function isAuditor(): boolean {
  return getUserRole() === "AUDITOR";
}

export function isUser(): boolean {
  return getUserRole() === "USER";
}

export function logout(): void {
  removeToken();
  window.location.href = "/login";
}

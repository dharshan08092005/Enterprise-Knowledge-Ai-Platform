export function getToken() {
  return localStorage.getItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getUserRole(): string | null {
  return localStorage.getItem("role"); // e.g. "admin", "user"
}

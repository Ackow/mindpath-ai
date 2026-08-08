const AUTH_USER_KEY = 'ai-learning:auth-user';

export function setAuthUser(user: unknown) {
  try { window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)); } catch { /* ignore storage errors */ }
}

export function clearAuthUser() {
  try { window.localStorage.removeItem(AUTH_USER_KEY); } catch { /* ignore storage errors */ }
}

export function isAuthenticated() {
  try { return Boolean(window.localStorage.getItem(AUTH_USER_KEY)); } catch { return false; }
}

export function requireLogin() {
  if (isAuthenticated()) return true;
  const shouldLogin = window.confirm('保存学习数据需要登录。现在前往登录或注册页面吗？');
  if (shouldLogin) window.location.assign('/auth');
  return false;
}

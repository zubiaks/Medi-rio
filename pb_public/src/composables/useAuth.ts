/** Mediário | Composable público da autenticação. */
import {
  authState,
  changePassword,
  confirmPasswordReset,
  initializeAuth,
  login,
  logout,
  requestPasswordReset,
  updateProfile,
} from "@/domain/auth/authStore";

export function useAuth() {
  return {
    ...authState,
    initializeAuth,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    updateProfile,
    changePassword,
  };
}

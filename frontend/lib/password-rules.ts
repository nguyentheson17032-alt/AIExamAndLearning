export const PASSWORD_RULES = [
  { id: "length", label: "Ít nhất 8 ký tự", test: (password: string) => password.length >= 8 },
  { id: "lower", label: "Có chữ thường", test: (password: string) => /[a-z]/.test(password) },
  { id: "upper", label: "Có chữ hoa", test: (password: string) => /[A-Z]/.test(password) },
  { id: "digit", label: "Có chữ số", test: (password: string) => /\d/.test(password) },
] as const;

export function passwordRuleError(password: string): string | null {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  return failed ? `Mật khẩu cần: ${failed.label.toLowerCase()}.` : null;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  
  if (password.length > 50) {
    return { isValid: false, message: 'Mật khẩu không được vượt quá 50 ký tự' };
  }
  
  return { isValid: true };
};

export const validateFullName = (fullName: string): { isValid: boolean; message?: string } => {
  if (fullName.length < 2) {
    return { isValid: false, message: 'Tên phải có ít nhất 2 ký tự' };
  }
  
  if (fullName.length > 50) {
    return { isValid: false, message: 'Tên không được vượt quá 50 ký tự' };
  }
  
  return { isValid: true };
};

export const validateLoginForm = (username: string, password: string): { isValid: boolean; message?: string } => {
  if (!username.trim()) {
    return { isValid: false, message: 'Vui lòng nhập email hoặc tên người dùng' };
  }
  
  if (!password.trim()) {
    return { isValid: false, message: 'Vui lòng nhập mật khẩu' };
  }
  
  return { isValid: true };
};

export const validateRegisterForm = (
  email: string,
  fullName: string,
  password: string,
  confirmPassword: string
): { isValid: boolean; message?: string } => {
  if (!email.trim()) {
    return { isValid: false, message: 'Vui lòng nhập email' };
  }
  
  if (!validateEmail(email)) {
    return { isValid: false, message: 'Email không hợp lệ' };
  }
  
  const fullNameValidation = validateFullName(fullName);
  if (!fullNameValidation.isValid) {
    return fullNameValidation;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Mật khẩu xác nhận không khớp' };
  }
  
  return { isValid: true };
};

export type LoginRequest = {
    email: string,
    password:string
};

export type AuthUser = {
    id:string,
    name: string,
    email: string
};

export type LoginResponse = {
    token: string,
    user:string,
}

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  email: string;
  token: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};
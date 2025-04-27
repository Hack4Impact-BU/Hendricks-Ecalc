export interface User2FASend {
  userEmail: string,
  userId: string
}

export interface User2FACheck {
  userId: string,
  code: string
}
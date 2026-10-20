export type UserRole = 'patient' | 'nutritionist';

export interface UserSession { id: string; name: string; email: string; role: UserRole; birthDate?: string }
export interface StoredAccount extends UserSession { password: string }
export interface RegisterPayload { name: string; email: string; password: string; role: UserRole }

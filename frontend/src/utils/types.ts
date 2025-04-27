export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  two_fa_verified: boolean | null;
  password: string | null;
  created: string;
}
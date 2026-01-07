import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      userType: string;
      tenantId?: string;
      tenantName?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    userType: string;
    tenantId?: string;
    tenantName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    userType: string;
    tenantId?: string;
    tenantName?: string;
  }
}

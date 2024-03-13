import { Gender, Role } from "@prisma/client";

export type TUser = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  role: Role;
  imageUrl: string | null;
};

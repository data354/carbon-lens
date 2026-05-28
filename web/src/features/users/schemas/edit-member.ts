import { CreateUserSchema } from "./create-user";
import { z } from "zod";

export const EditMemberSchema = CreateUserSchema.pick({
  fullName: true,
  role: true,
}).partial();

export type IEditMemberInput = z.infer<
  typeof EditMemberSchema
>;

import { z } from "zod";
import { CreateUserSchema } from "./create-user";

export const UpdateNameSchema = CreateUserSchema.pick({
  fullName: true,
});

export type IUpdateNameInput = z.infer<
  typeof UpdateNameSchema
>;

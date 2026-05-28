import { roles } from "@/features/auth/constants";
import { z } from "zod";

export const DeleteMemberSchema = z.object({
  id: z.string().nonempty(),
  role: z.enum(roles),
});

export type IDeleteMemberInput = z.infer<
  typeof DeleteMemberSchema
>;

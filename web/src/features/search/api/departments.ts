import { geoKyClient } from "@/lib/ky";

export async function getDepartments(date: string) {
  const res = await geoKyClient
    .get(`geo/departments/${date}/all`)
    .json<{ departments: string[] }>()
    .catch((err) => {
      console.log("❌ Error fetching departments:", err);
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching departments:",
      res.detail,
    );

    throw Error("Error response fetching departments");
  }

  return res.departments;
}

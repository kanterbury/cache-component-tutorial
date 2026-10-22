"use server";

import { cookies } from "next/headers";

export async function switchUser(formData: FormData) {
  const user = String(formData.get("user") ?? "guest");
  (await cookies()).set("demo-user", user);
}

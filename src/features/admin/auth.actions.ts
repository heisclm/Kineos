"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, userRoles, roles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed." };
  }

  // Verify the user is actually an admin
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'admin')).limit(1);
  if (!adminRole.length) {
    await supabase.auth.signOut();
    return { error: "System configuration error. Admin role missing." };
  }

  const userRole = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, data.user.id),
        eq(userRoles.roleId, adminRole[0].id)
      )
    )
    .limit(1);

  if (!userRole.length) {
    // If not an admin, immediately sign them out and reject
    await supabase.auth.signOut();
    return { error: "Unauthorized. Admin privileges required." };
  }

  // Redirect to dashboard on success
  redirect("/admin");
}

import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = locals.user; // Get user from server session
  
  if (!user && url.pathname !== "/auth/login") {
    throw redirect(302, "/auth/login");
  }

  return { user: user };
};

import { getCurrentUser } from "@/lib/server/session";
import { ok, route } from "@/lib/server/http";

export const GET = route(async () => ok({ user: await getCurrentUser() }));

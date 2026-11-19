// Gives a user admin access to the admin dashboard.
// Usage: npm run make-admin -- you@example.com              (existing account)
//        npm run make-admin -- you@example.com "password"   (creates the account if needed)
import { supabase } from "../lib/supabase.js";

const [email, password] = process.argv.slice(2);
if (!email) {
  console.error('Usage: npm run make-admin -- <email> ["password"]');
  process.exit(1);
}

async function findUser(target) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (user || data.users.length < 1000) return user;
  }
}

let user = await findUser(email);
if (!user) {
  if (!password) {
    console.error(`No account for ${email}. Sign up first, or pass a password to create it.`);
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Admin" },
  });
  if (error) throw error;
  user = data.user;
  console.log(`Created account ${email}`);
}

const { error } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: "admin" },
});
if (error) throw error;
console.log(`${email} is now an admin.`);

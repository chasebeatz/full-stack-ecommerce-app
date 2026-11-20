import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><div className="skeleton mx-auto h-[32rem] max-w-5xl" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

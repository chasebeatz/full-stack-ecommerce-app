import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";

export default function FormAlert({ type = "error", children }) {
  if (!children) return null;
  const ok = type === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl p-3.5 text-sm ${ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}
    >
      {ok ? <HiCheckCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <HiExclamationCircle className="mt-0.5 h-5 w-5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

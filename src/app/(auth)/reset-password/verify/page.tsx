import { Suspense } from "react";
import ResetPasswordVerifyForm from "./ResetPasswordVerifyForm";

// Make this route dynamic to ensure it's not pre-rendered
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading verification form...</div>}>
      <ResetPasswordVerifyForm />
    </Suspense>
  );
}

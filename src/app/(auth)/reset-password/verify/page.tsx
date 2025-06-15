import { Suspense } from "react";
import ResetPasswordVerifyForm from "./ResetPasswordVerifyForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordVerifyForm />
    </Suspense>
  );
}

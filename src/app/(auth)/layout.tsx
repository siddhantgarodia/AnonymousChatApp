export const metadata = {
  title: "Authentication | Honest-Feedback",
  description: "Sign in or create an account for Honest-Feedback",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="auth-layout">{children}</section>;
}

export const metadata = {
  title: "Authentication | AnonChat",
  description: "Sign in or create an account for AnonChat",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="auth-layout">{children}</section>;
}

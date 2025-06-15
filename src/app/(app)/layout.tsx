export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="app-layout">{children}</section>;
}

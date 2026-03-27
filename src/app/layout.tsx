export const metadata = {
  title: "Golf Charity SaaS",
  description: "Play Golf. Win Prizes. Change Lives."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
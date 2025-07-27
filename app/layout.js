import "./globals.css";

export const metadata = {
  title: "Receipt Ranger",
  description: "Compare product prices from uploaded receipts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

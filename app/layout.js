import "./globals.css";

export const metadata = {
  title: "LV Safari Runner",
  description: "Louis Vuitton Safari Runner Game",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

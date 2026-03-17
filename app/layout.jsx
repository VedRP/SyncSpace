import "./globals.css";

export const metadata = {
  title: "SymmetryLab",
  description:
    "A modern frontend UI ready to connect to backend later.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

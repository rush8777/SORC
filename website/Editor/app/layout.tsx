import './globals.css'

export const metadata = {
  title: 'Interactive Lesson Editor | Code Tutoring Platform',
  description: 'Learn how real repositories work with step-by-step guided lessons. Understand structure, data flow, API requests, and more.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased overflow-hidden">
        {children}
      </body>
    </html>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-8 text-center text-gray-500 text-sm">
      <p>&copy; {currentYear} Indonesian Text-to-Speech Converter. All rights reserved.</p>
    </footer>
  );
}

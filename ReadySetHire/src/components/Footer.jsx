/**
 * Footer component.
 *
 * Displays a simple footer with the current year and the app tagline.
 * Stays visible across all pages, typically at the bottom of the layout.
 *
 * @component
 * @example
 * <Footer />
 *
 * @returns {JSX.Element} The rendered Footer component.
 */
function Footer() {
  return (
    <footer className="text-center py-3 border-top mt-4">
      <small>
        © {new Date().getFullYear()} ReadySetHire - Streamlining the hiring process with AI
      </small>
    </footer>
  );
}

export default Footer;

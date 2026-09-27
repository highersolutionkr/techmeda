const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "테크미디어";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 py-8 text-center text-xs text-black/40">
      <p>
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </p>
    </footer>
  );
}

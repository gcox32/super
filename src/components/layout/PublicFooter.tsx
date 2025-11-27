import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background fixed bottom-0 left-0 right-0 z-10">
      <div className="md:max-w-4xl md:mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Super Soldier Program. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms-of-service"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

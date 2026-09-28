import { Button } from '@/components/ui/button';

// Placeholder homepage — proves Next.js, Tailwind and shadcn/ui are wired up.
// The real homepage (movie listing) is built in Phase 8.
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Movie Booking</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Browse movies, pick your seats, and book tickets in seconds.
      </p>
      <Button size="lg" disabled>
        Browse movies — coming soon
      </Button>
    </main>
  );
}

import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme-toggle";
import Image from "next/image";

export default function SignedOutNav() {
  return (
    <header className="flex h-16 items-center justify-between px-4 md:px-6">
      <Link
        href="#"
        className="hidden items-center gap-2 lg:flex"
        prefetch={false}
      >
        <Image src="/favicon.ico" alt="GameX logo" width={48} height={48} />
        <span className="text-lg font-semibold"> GameX</span>
      </Link>
      <nav className="hidden gap-4 text-sm font-medium lg:flex">
        <Link href="/" className="hover:underline" prefetch={false}>
          Home
        </Link>
      </nav>
      <div className="relative hidden max-w-md flex-1 space-x-4 lg:flex">
        <Button asChild>
          <Link href="/sign-in">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}

/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/yW30R1nCz0L
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import Link from "next/link";
import { JSX, SVGProps } from "react";

export function SignedOutfooter() {
  return (
    <footer className="absolute bottom-0 w-full bg-gray-100 p-6 dark:bg-gray-800 md:py-12">
      <div className="container flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <span className="text-lg font-semibold"> GameX</span>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; 2024 GameX. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

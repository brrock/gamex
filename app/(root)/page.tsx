import { SignedOutfooter } from '@/components/signed-out/footer'
import Hero from '@/components/signed-out/hero'
import SignedOutMobileNav from '@/components/signed-out/mobile-nav'
import SignedOutNav from '@/components/signed-out/nav'
import { ModeToggle } from '@/components/theme-toggle'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import React from 'react'

const Home = () => {
  return (
    <div>
        <SignedIn><UserButton /></SignedIn>
        <SignedOut>
        <SignedOutMobileNav />
            <SignedOutNav />
            <Hero />
            <SignedOutfooter />
        </SignedOut>
    </div>
  )
}

export default Home


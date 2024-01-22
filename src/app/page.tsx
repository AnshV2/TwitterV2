'use client'

import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { api } from "~/trpc/react";

export default function Home() {
  noStore();
  const user = useUser();
  const posts = api.post.getMany.useQuery();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div>
        {!user.isSignedIn && <SignInButton></SignInButton >}
        {!!user.isSignedIn && <SignOutButton></SignOutButton>}
        <div>{posts.data?.map((post) => {return <div key = {post.id}>{post.content}</div>})}</div>
        </div>
      </div>
    </main>
  );
}

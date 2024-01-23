'use client'

import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";

import {useState, useRef} from "react"



export default function Home() {
  noStore();
  const user = useUser();
  const posts = api.post.getMany.useQuery();
  const [input, setInput] = useState("");
  const ref = useRef<HTMLInputElement>(null)

  
  const {mutate} = api.post.create.useMutation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div>
        {!user.isSignedIn && <SignInButton></SignInButton >}
        {!!user.isSignedIn && <SignOutButton></SignOutButton>}

        <div>{posts.data?.map((post) => {return <>
          <div key = {post.content.id}>{post.content.content}</div>
          <img src = {post.author?.imageUrl}></img>
        </>})}</div>
        </div>

        <input ref = {ref} className = "text-purple-500"></input>
        <button onClick = {() => mutate({content: ref.current?.value})}>make a post</button>

      </div>
    </main>
  );
}

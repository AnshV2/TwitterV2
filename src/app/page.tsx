'use client'

import { unstable_noStore as noStore } from "next/cache";
import { SignIn,  useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime);
import {useRef} from "react"
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link'
import { Public } from "@prisma/client/runtime/library";
import Image from 'next/image'
import { Loading } from "./_components/loading";


const Feed = () => {
  const {data, isLoading: postsLoading} = api.post.getMany.useQuery()

  if (postsLoading) {
    return (
      <div className = "flex h-full w-full justify-center items-center">
      <Loading />
      </div>
    )
  }
  return (
    <>
      {{data}.data?.map((post) => 
          {return <div  key = {post.content.id} className = "flex w-full h-28 pl-16 border-t-2 border-b-2  border-slate-500 py-5">
            <Link href={`/${post.author?.id}`}>
            <img src = {post.author?.imageUrl} className = "size-16 rounded-full mr-8"></img>
            </Link>
            <div className = "">
              <Link href={`/${post.author?.id}`}>
                <div key = {post.content.id} className = "text-l relative  text-slate-300">@{post.author?.username} · {dayjs(post.content.createdAt).fromNow()}</div>
              </Link>
              <div  className = "text-2xl relative top-2.5">{post.content.content}</div>
            </div>
          </div>})}
    </>
  )
}

export default function Home() {
  noStore();
  const user = useUser();
  const ref = useRef<HTMLInputElement>(null)

  const ctx = api.useUtils()

  const {mutate} = api.post.create.useMutation( {
    onSuccess: () => 
    {
    if (ref.current) {
      ref.current.value = "";
    }
    void ctx.post.getMany.invalidate();
  },
  onError: (e) => {
    const emsg = e.data?.zodError?.fieldErrors.content;
    if (emsg) { 
      if (emsg[0]) {
        toast.error(emsg[0]);
      }
    }
    else {
      toast.error("Failed to Post")
    }
  }
  });

  const {data} = api.post.getMany.useQuery()

  return (
    <main className="flex flex-col items-center  h-screen w-screen bg-slate-950">
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
        <SignIn></SignIn>
        <div className = "flex w-2/5 h-35 p-4 pl-16  border-t-2 border-l-2 border-r-2 border-slate-500">
          <img src = {user.user?.imageUrl} className = "size-16 rounded-full "></img>
          <input ref = {ref} className = "text-purple-500 m-4 ml-8 bg-transparent outline-none" placeholder="Type some emojis!"></input>
          <button onClick = {() => {
            if (ref.current != null) {mutate({content: ref.current.value })}
            }} className = "text-slate-200 content-right ml-40">Post</button>
        </div>

        <div className = "flex flex-col w-2/5 h-3/4 overflow-y-scroll border-2 border-slate-500">
            <Feed />
        </div>

        <div className = "flex w-2/5 h-35 p-4 pl-16 justify-center content-center  border-2 border-slate-500">
          <a href="https://github.com/AnshV2/TwitterV2"><img src = "/github.png" className = "size-16 rounded-full "></img></a>
        </div>

    </main>
  );
}

'use client'

import { unstable_noStore as noStore } from "next/cache";
import { SignIn,  useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime);
import {useRef} from "react"



export default function Home() {
  noStore();
  const user = useUser();
  const posts = api.post.getMany.useQuery();
  const ref = useRef<HTMLInputElement>(null)

  const ctx = api.useUtils()

  const {mutate} = api.post.create.useMutation( {onSuccess: () => {
    if (ref.current) {
      ref.current.value = "";
    }
    void ctx.post.getMany.invalidate();
  }});

  return (
    <main className="flex flex-col items-center h-full w-full justify-center bg-slate-950">
        <SignIn></SignIn>
        <div className = "flex w-2/5 h-35 p-4 pl-16  border-t-2 border-l-2 border-r-2 border-slate-500">
          <img src = {user.user?.imageUrl} className = "size-16 rounded-full "></img>
          <input ref = {ref} className = "text-purple-500 m-4 bg-transparent outline-none" placeholder="Type some emojis!"></input>
          <button onClick = {() => {
            if (ref.current != null) {mutate({content: ref.current.value})}
            }} className = "text-purple-500">make a post</button>
        </div>

        <div className = " w-2/5 min-h-screen border-2  border-slate-500">
          {api.post.getMany.useQuery().data?.map((post) => 
          {return <div  className = "flex w-full h-28 pl-16 border-t-2 border-b-2  border-slate-500 py-5">
            <img src = {post.author?.imageUrl} className = "size-16 rounded-full mr-8"></img>
            <div className = "">
              <div key = {post.content.id} className = "text-l relative  text-slate-300">@{post.author?.username} · {dayjs(post.content.createdAt).fromNow()}</div>
              <div  className = "text-2xl relative top-2.5">{post.content.content}</div>
            </div>
          </div>})}

        </div>

    </main>
  );
}

'use client'

import { unstable_noStore as noStore } from "next/cache";
import { SignIn,  useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime);
import {useRef} from "react"
import toast, { Toaster } from 'react-hot-toast';




export default function userPage({ params }: { params: { id: string } }) {

    const filleruser = api.post.getUserPic.useQuery({userRequested: params.id})

    return <div className="flex flex-col items-center  h-screen w-screen bg-slate-950">

        <div className = "flex w-2/5 h-35 p-4 pl-16  border-t-2 border-l-2 border-r-2 border-slate-500">
          <img src = {filleruser.data?.imageUrl} className = "size-16 rounded-full "></img>
          <div className = "text-l relative  text-slate-100 top-8 left-7">@{filleruser.data?.username} </div>
        </div>


        <div className = "flex flex-col w-2/5 h-3/4 border-2 border-slate-500 overflow-y-scroll">
          {api.post.getOneUser.useQuery({userRequested: params.id}).data?.map((post) => 
          {return <div  key = {post.content.id} className = "flex w-full h-28 pl-16 border-t-2 border-b-2  border-slate-500 py-5">
            <img src = {post.author?.imageUrl} className = "size-16 rounded-full mr-8"></img>
            <div className = "">
              <div key = {post.content.id} className = "text-l relative  text-slate-300">@{post.author?.username} · {dayjs(post.content.createdAt).fromNow()}</div>
              <div  className = "text-2xl relative top-2.5">{post.content.content}</div>
            </div>
          </div>})}

        </div>
    </div>
  }
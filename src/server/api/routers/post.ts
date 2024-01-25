import { z } from "zod";
import { clerkClient } from '@clerk/nextjs';
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

import { createTRPCRouter, publicProcedure , privateProcedure} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Input } from "postcss";
import { equal } from "assert";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});


export const postRouter = createTRPCRouter({
  getMany: publicProcedure.query(async ({ ctx }) => {
    const posts = (await ctx.db.post.findMany({orderBy: [{
      createdAt: 'desc'
    }], take: 100}))
    const users = await clerkClient.users.getUserList();
    const final = posts.map((post) => {return {
      content: post,
      author: users.find((user) => user.id === post.author),
    }})
    return final;
  }),

  getOneUser: publicProcedure.input(z.object({
    userRequested: z.string()
  })).query(async ({ ctx, input }) => {
    const posts = (await ctx.db.post.findMany({orderBy: [{
      createdAt: 'desc'
    }], 
    take: 100,
    where: {author: {equals: input.userRequested}}}))
    const users = await clerkClient.users.getUserList();
    const final = posts.map((post) => {return {
      content: post,
      author: users.find((user) => user.id === post.author),
    }})
    return final;
  }),

  getUserPic: publicProcedure.input(z.object({
    userRequested: z.string()
  })).query(async ({ ctx, input }) => {
    const users = await clerkClient.users.getUserList();
    return users.find((user) => user.id === input.userRequested)
  }),
  create: privateProcedure.input(z.object({
    content: z.string().emoji().min(1).max(280)
  })).mutation(async ({ctx, input}) => {
    const userid = ctx.session;
    const identifier = userid;
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      throw new TRPCError({code: "TOO_MANY_REQUESTS"});
    }


    const post = await ctx.db.post.create({
      data: {
        author: userid,
        content: input.content,
      }
    })

    return post;
  })
});
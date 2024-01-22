import { z } from "zod";
import { clerkClient } from '@clerk/nextjs';

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getMany: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany()
    const users = await clerkClient.users.getUserList();
    const final = posts.map((post) => {return {
      content: post,
      author: users.find((user) => user.id === post.author),
    }})
    return final;
  }),
});
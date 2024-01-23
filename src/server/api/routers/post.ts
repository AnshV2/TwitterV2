import { z } from "zod";
import { clerkClient } from '@clerk/nextjs';

import { createTRPCRouter, publicProcedure , privateProcedure} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getMany: publicProcedure.query(async ({ ctx }) => {
    const posts = (await ctx.db.post.findMany({orderBy: [{
      createdAt: 'desc'
    }]}))
    const users = await clerkClient.users.getUserList();
    const final = posts.map((post) => {return {
      content: post,
      author: users.find((user) => user.id === post.author),
    }})
    return final;
  }),

  create: privateProcedure.input(z.object({
    content: z.string().emoji().min(1).max(280)
  })).mutation(async ({ctx, input}) => {
    const userid = ctx.session;

    const post = await ctx.db.post.create({
      data: {
        author: userid,
        content: input.content,
      }
    })

    return post;
  })
});
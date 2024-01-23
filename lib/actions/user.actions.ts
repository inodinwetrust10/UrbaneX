"use server"

import { connectToDB } from "../mongoose"
import User from "../models/user.model"
import { revalidatePath } from "next/cache";
import Issue from "../models/issue.model";

export async function fetchUser(userId: string) {
    try {
      connectToDB();

      return await User.findOne(
        { id: userId })
    //     .populate({
    //     path: "communities",
    //     model:Community
    //   });
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
  }

export async function updateUser(
   {
    userId,
    username,
    name,
    bio,
    image,
    path,
   }: Params): Promise<void> {
   connectToDB();

    try {
        await User.findOneAndUpdate(
            {id: userId},
            {username: username.toLowerCase(),
             name: name,
             bio: bio,
             image: image,
             onboarded:true,
            },
            {upsert: true}
            );

            if(path === '/profile/edit'){
                revalidatePath(path);
            }
    } catch (error:any) {
        throw new Error(`Error creating/updating user: ${error.message}`);
    } 
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    const issues = await User.findOne({ id: userId }).populate({
      path: "issues",
      model: Issue,
      populate: [
        {
          path: "children",
          model: Issue,
          populate: {
            path: "author",
            model: User,
            select: "name image id", 
          },
        },
      ],
    });
    return issues;
  } catch (error) {
    console.error("Error fetching user issues:", error);
    throw error;
  }
}
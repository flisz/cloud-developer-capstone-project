import { PostsAccess } from './postsAccess'
import { PostItem } from '../models/PostItem'
import { CreatePostRequest } from '../requests/CreatePostRequest'
import { UpdatePostRequest } from '../requests/UpdatePostRequest'
import * as uuid from 'uuid'
import {PostUpdate} from "../models/PostUpdate";

const postsAccess = new PostsAccess()

export async function getAllPosts(userId: string): Promise<PostItem[]> {
    return await postsAccess.getAllPosts(userId)
}

export async function createPost(
  createPostRequest: CreatePostRequest,
  userId: string
): Promise<PostItem> {
  const postId = uuid.v4()

  return await postsAccess.createPost({
    userId: userId,
    postId: postId,
    createdAt: new Date().toISOString(),
    name: createPostRequest.name,
    dueDate: createPostRequest.dueDate,
    done: false,
    attachmentUrl: ""
  })
}

export async function updatePost(
    postId: string,
    updatePostRequest: UpdatePostRequest,
    userId: string
): Promise<PostUpdate> {
  return await postsAccess.updatePost(postId, updatePostRequest, userId)
}

export async function deletePost(postId: string, userId: string) {
  return await postsAccess.deletePost(postId, userId)
}

export async function generateUploadUrl(postId: string, userId: string) {
  return await postsAccess.generateUploadUrl(postId, userId)
}

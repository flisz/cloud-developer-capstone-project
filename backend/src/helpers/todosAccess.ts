import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { PostItem } from '../models/PostItem'
import { PostUpdate } from '../models/PostUpdate';
import {getUploadUrl} from "./attachmentUtils";

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('PostsAccess')

// TODO: Implement the dataLayer logic

export class PostsAccess {
    // XRAY is implemented down in the createDynamoDBClient below
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly postsTable = process.env.POSTS_TABLE,
        private readonly postsIndex = process.env.POSTS_CREATED_AT_INDEX
    ) {
    }

    async getAllPosts(userId: string): Promise<PostItem[]> {
        logger.info('Getting all posts')

        const result = await this.docClient
            .query({
                TableName: this.postsTable,
                IndexName: this.postsIndex,
                ExpressionAttributeValues: {
                    ':userId': userId
                },
                KeyConditionExpression: 'userId = :userId'
            })
            .promise()

        const items = result.Items
        logger.info(`items: ${items}`)
        return items as PostItem[]
    }

    async createPost(postItem: PostItem): Promise<PostItem> {
        logger.info(`Creating item: ${postItem}`)
        logger.info(`postItem.userId: ${postItem.userId}`)
        logger.info(`postItem.postId: ${postItem.postId}`)
        logger.info(`postItem.createdAt: ${postItem.createdAt}`)
        logger.info(`postItem.name: ${postItem.name}`)
        logger.info(`postItem.dueDate: ${postItem.dueDate}`)
        logger.info(`postItem.done: ${postItem.done}`)
        logger.info(`postItem.attachmentUrl: ${postItem.attachmentUrl}`)

        const params = {
            TableName: this.postsTable,
            Item: postItem
        }
        await this.docClient.put(params).promise()
        return postItem
    }

    async updatePost(
        postId: string,
        updatePostData: PostUpdate,
        userId: string): Promise<PostUpdate> {
        logger.info(`updating user: ${userId}, post: ${postId}`)

        const params = {
            TableName: this.postsTable,
            Key: {
                userId: userId,
                postId: postId
            },
            UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeNames: {"#name": "name"},
            ExpressionAttributeValues: {
                ":name": updatePostData.name,
                ":dueDate": updatePostData.dueDate,
                ":done": updatePostData.done
            },
            ReturnValues: 'ALL_NEW'
        };
        const updatedPost = await this.docClient.update(params).promise()

        logger.info(`Updated: ${updatedPost.Attributes}`)

        return updatePostData
    }

    async deletePost(postId: string, userId:string): Promise<boolean> {
        const param = {
            TableName: this.postsTable,
            Key: {
                postId: postId,
                userId: userId
            }
        }
        await this.docClient.delete(param).promise()
        return true
    }

    async generateUploadUrl(postId, userId:string): Promise<string> {
        const uploadUrl = getUploadUrl(postId)
        logger.info(`got url: ${uploadUrl}`)
        await this.docClient.update({
            TableName: this.postsTable,
            Key: { userId, postId },
            UpdateExpression: "set attachmentUrl=:URL",
            ExpressionAttributeValues: {
              ":URL": uploadUrl.split("?")[0]
          },
          ReturnValues: "UPDATED_NEW"
        })
        .promise();

        return uploadUrl;
    }
};

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

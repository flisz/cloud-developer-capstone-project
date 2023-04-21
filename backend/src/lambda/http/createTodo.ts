import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreatePostRequest } from '../../requests/CreatePostRequest'
import { getUserId } from '../utils';
import { createPost } from '../../helpers/posts'
import { createLogger } from "../../utils/logger";

const logger = createLogger('CreatePost');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      logger.info('Processing event: ', event);
      const postData: CreatePostRequest = JSON.parse(event.body)
      logger.info('Creating new post item')

      const userId = getUserId(event);
      const newPost = await createPost(postData, userId)

      logger.info(`returned post: ${newPost}`)
      logger.info(`userId: ${newPost.userId}`)
      logger.info(`postId: ${newPost.postId}`)
      logger.info(`createdAt: ${newPost.createdAt}`)
      logger.info(`name: ${newPost.name}`)
      logger.info(`dueDate: ${newPost.dueDate}`)
      logger.info(`done: ${newPost.done}`)
      logger.info(`attachmentUrl: ${newPost.attachmentUrl}`)

      return {
          statusCode: 201,
          body: JSON.stringify({
              "item": newPost
          })
      }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

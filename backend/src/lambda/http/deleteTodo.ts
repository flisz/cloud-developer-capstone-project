import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deletePost } from '../../helpers/posts'
import { getUserId } from '../utils'
import {createLogger} from "../../utils/logger";

const logger = createLogger("deletePosts")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const postId = event.pathParameters.postId
      const userId = getUserId(event)

      // TODO: Remove a TODO item by id

      logger.info(`Attempting to delete post: ${postId} as user: ${userId}`)

      await deletePost(postId, userId)

      return {
          statusCode: 200,
          body: JSON.stringify({})
      }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

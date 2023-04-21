import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updatePost } from '../../helpers/posts'
import { UpdatePostRequest } from '../../requests/UpdatePostRequest'
import { getUserId } from '../utils'
import {createLogger} from "../../utils/logger";

const logger = createLogger("updatePost")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      const postId = event.pathParameters.postId
      const postData: UpdatePostRequest = JSON.parse(event.body)
      const userId = getUserId(event)

      logger.info(`Attempting to update post: ${postId} with user ${userId} with data: ${postData}`)

      // TODO: Update a TODO item with the provided id using values in the "updatedPost" object
      await updatePost(postId, postData, userId)

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

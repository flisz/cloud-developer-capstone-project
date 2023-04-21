import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import { getAllPosts } from "../../helpers/posts";
import {createLogger} from "../../utils/logger";

const logger = createLogger("getPosts")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
      // TODO: Get all TODO items for a current user

      const userId = getUserId(event)
      logger.info(`Getting posts for user: ${userId}`)
      const posts = await getAllPosts(userId)

      return {
          statusCode: 200,
          body: JSON.stringify({
              items: posts
          })
      }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

import {createLogger} from "../utils/logger";
const logger = createLogger('attachmentUtils')
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export function getUploadUrl(postId: string) {
  logger.info(`getting upload URL for: ${postId}`)
  const params = {
    Bucket: process.env.ATTACHMENT_S3_BUCKET,
    Key: postId,
    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
  }
  logger.info(`Bucket: ${params.Bucket}`)
  logger.info(`Key: ${params.Key}`)
  logger.info(`Expires: ${params.Expires}`)
  const url = s3.getSignedUrl('putObject', params)
  logger.info(`got url: ${url}`)
  return url
}
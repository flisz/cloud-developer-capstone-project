import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://flis.us.auth0.com/.well-known/jwks.json'

const cert = `-----BEGIN CERTIFICATE-----
MIIC/TCCAeWgAwIBAgIJTvxa1+s3lgYEMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV
BAMTEWZsaXMudXMuYXV0aDAuY29tMB4XDTIwMDcxMjIxNDUxM1oXDTM0MDMyMTIx
NDUxM1owHDEaMBgGA1UEAxMRZmxpcy51cy5hdXRoMC5jb20wggEiMA0GCSqGSIb3
DQEBAQUAA4IBDwAwggEKAoIBAQCxw+rZIx+PJVHSPvXTM8fLr95KbVtnSgOTaH2U
GV62Ka+Pn1733l5mChNMMEj+F9uT3URHSR7ggGWsh7SaWLoFftWHHJiU4/cP4hMx
lu0Z4waBbY122EyJa5hny9MIx+XBQdx0uFM0re02tk1/Usi0dx8OJQ4bSz9a5dMr
A7nSsxrO84FUp1I5auImGvYyAG6mt4dkg0PRNFmma5tGTJ2PfjTZNgsS6pu2SCoh
jwHf6xZEmHQS0Ims2vedR40e3J6GRZe/PKDCz5sF4lF7Zy304Bxwkzp10tyxowZi
/J2qa4rFuV40GnAGs7gzE/p6lv9dcQ7iFiQfMw52pjlXzTJjAgMBAAGjQjBAMA8G
A1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFAvkfCr0+v0HNA0forDJtt2W+FVoMA4G
A1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAPXfw5JHi8RS5zQQxkzHo
FRJpXBiF+5yWgKeIt8bXBmP6kDF4fuUTe1j+B/+s3M79p5FWRKhyg7QPyI/gMFnn
vaZKZniHoA7JCTCbnwtWBRzriAL2357jTsopPWLsvTM3Z+eTG8eKVLqeBKpX+MtV
e4s4b7NdtCs6/a+7GFAdskEksz/MOvNB3l9yRoaxMA/l4reeIAi+GlXCSoTxYKs0
T+KprkvvmgOQqtase4hSlextmXigzrOFvDnYjtGi9omHv4Pa/JkNn6D8R250hEhl
7LEe4O+7RO16M1808q8GGansgRie6X1ord/QRrtRPTxGQv4nfjAvVoE/r8CaTVJF
/w==
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  logger.info(`got jwt: ${jwt}`)
  const jwks = await Axios.get(jwksUrl)
  logger.info(`got jwks: ${jwks}`)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}



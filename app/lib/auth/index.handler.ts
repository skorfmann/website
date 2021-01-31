import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { PostConfirmationConfirmSignUpTriggerEvent, CustomMessageAdminCreateUserTriggerEvent } from 'aws-lambda'

export interface ReservedLambdaEnv extends PostConfirmationEnv {
  '_HANDLER': string // – The handler location configured on the function.
  '_X_AMZN_TRACE_ID': string // – The X-Ray tracing header.

// AWS_REGION – The AWS Region where the Lambda function is executed.

// AWS_EXECUTION_ENV – The runtime identifier, prefixed by AWS_Lambda_—for example, AWS_Lambda_java8.

// AWS_LAMBDA_FUNCTION_NAME – The name of the function.

// AWS_LAMBDA_FUNCTION_MEMORY_SIZE – The amount of memory available to the function in MB.

// AWS_LAMBDA_FUNCTION_VERSION – The version of the function being executed.

// AWS_LAMBDA_LOG_GROUP_NAME, AWS_LAMBDA_LOG_STREAM_NAME – The name of the Amazon CloudWatch Logs group and stream for the function.

// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN – The access keys obtained from the function's execution role.

// AWS_LAMBDA_RUNTIME_API – (Custom runtime) The host and port of the runtime API.

// LAMBDA_TASK_ROOT – The path to your Lambda function code.

// LAMBDA_RUNTIME_DIR – The path to runtime libraries.

// TZ
}
export interface PostConfirmationEnv {
  'USERS_TABLE': string
}

export type LambdaEnv = {
  [key in keyof PostConfirmationEnv]: PostConfirmationEnv[key];
}

export type LambdaRuntimeEnv = {
  [key in keyof ReservedLambdaEnv]: ReservedLambdaEnv[key];
}

const env = process.env as LambdaRuntimeEnv
const DocumentClient = new DynamoDB.DocumentClient()

export type PostConfirmationEvent = PostConfirmationConfirmSignUpTriggerEvent | CustomMessageAdminCreateUserTriggerEvent

export interface Event extends PostConfirmationConfirmSignUpTriggerEvent {}

export interface BasicUser {
  id: string,
  createdAt: string,
  updatedAt: string,
}

export const buildUser = (event: PostConfirmationEvent): BasicUser => {
  return {
    id: event.userName,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON()
  }
}

export const getHandler = (buildObject: (event: PostConfirmationEvent) => BasicUser = buildUser) => {
  return async (event: PostConfirmationEvent) => {
    if (event.triggerSource === 'PostConfirmation_ConfirmSignUp' || event.triggerSource === 'CustomMessage_AdminCreateUser') {
      const user: BasicUser = buildObject(event)
      await DocumentClient.put({
        TableName: env.USERS_TABLE,
        Item: user,
        ConditionExpression: 'attribute_not_exists(id)'
      }).promise()

      return event
    } else {
      return event
    }
  }
}

export const handler = getHandler()
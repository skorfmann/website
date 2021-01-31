import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda'
import { Gsi } from '../shared'

export interface ListNotesArg {
  limit: number
  authorId: number
  nextToken: string
}

type ListNotesEvent = AppSyncResolverEvent<ListNotesArg>

export const listNotesByAuthor = async (event: ListNotesEvent, client: DynamoDB.DocumentClient) => {
  const { authorId, limit, nextToken } = event.arguments

  const options: DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.TABLE_NAME!,
    IndexName: Gsi.byAuthor.name,
    KeyConditionExpression: `${Gsi.byAuthor.partitionKey} = :authorId`,
    ExpressionAttributeValues: {
      ':authorId': authorId
    },
    ConsistentRead: false,
    Limit: limit,
    ScanIndexForward: false
  }

  if (nextToken) {
    options.ExclusiveStartKey = {
      id: nextToken
    }
  }

  const result = await client.query(options).promise()

  return {
    items: result.Items,
    nextToken: result.LastEvaluatedKey
  }
}
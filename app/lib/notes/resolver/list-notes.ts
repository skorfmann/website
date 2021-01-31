import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda'
import { Gsi } from '../shared'

export interface ListNotesArg {
  limit: number,
  nextToken: string
}

type ListNotesEvent = AppSyncResolverEvent<ListNotesArg>

export const listNotes = async (event: ListNotesEvent, client: DynamoDB.DocumentClient) => {
  const result = await client.query({
    TableName: process.env.TABLE_NAME!,
    ConsistentRead: false,
    Limit: event.arguments.limit,
    IndexName: Gsi.allByDate.name,
    KeyConditionExpression: `${Gsi.allByDate.partitionKey} = :scannable`,
    ExpressionAttributeValues: {
      ':scannable': 'Note'
    },
    ScanIndexForward: false
  }).promise()

  console.log(JSON.stringify(result.$response.data, null, 2))

  return {
    items: result.Items,
    nextToken: result.LastEvaluatedKey
  }
}
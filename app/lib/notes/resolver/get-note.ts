import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda'

export interface NoteArg {
  id: string
}

type GetNoteEvent = AppSyncResolverEvent<NoteArg>

export const getNote = async (event: GetNoteEvent, client: DynamoDB.DocumentClient) => {
  const result = await client.get({
    TableName: process.env.TABLE_NAME!,
    Key: {
      id: event.arguments.id
    }
  }).promise()

  return result.Item
}
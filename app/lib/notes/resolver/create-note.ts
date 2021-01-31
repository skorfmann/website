import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import { AppSyncResolverEvent } from 'aws-lambda'
import { ulid } from 'ulid';
import * as Yup from 'yup';

export const NoteSchema = Yup.object().shape({
  title: Yup.string()
    .required('Required'),
  body: Yup.string()
    .required('Required')
});

export interface NoteInput {
  title: string
  body: string
  tags: string[]
}

export interface NoteInputArguments {
  input: NoteInput
}

export interface Note {
  id: string,
  title: string
  body: string
  tags: string[]
  authorId: string
  createdAt: string,
  updatedAt: string,
}

export interface InternalNote extends Note {
  scannable: string
}

type CreateNoteEvent = AppSyncResolverEvent<NoteInputArguments>

export const buildObject = (event: CreateNoteEvent): InternalNote => {
  if (event.identity?.username === undefined) throw new Error("unauthorized");

  console.log({event: JSON.stringify(event, null, 2)})

  const { title, body, tags } = event.arguments.input;
  const basicObject = {
    title,
    body,
    tags
  }

  if (!NoteSchema.isValidSync(basicObject)) throw new Error("invalid");

  const id = ulid();
  const timestamp = new Date().toJSON();
  return {
    id,
    ...basicObject,
    authorId: event.identity.username,
    createdAt: timestamp,
    updatedAt: timestamp,
    scannable: 'Note'
  }
}

export const createNote = async (event: CreateNoteEvent, client: DynamoDB.DocumentClient) => {
  const note = buildObject(event)
  await client.put({
    TableName: process.env.TABLE_NAME!,
    Item: note,
    ConditionExpression: 'attribute_not_exists(id)'
  }).promise()

  return note
}
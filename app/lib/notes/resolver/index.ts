import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import * as AWSXRay from 'aws-xray-sdk-core';

import { createNote } from './create-note';
import { getNote } from './get-note';
import { listNotesByAuthor } from './list-notes-by-author';
import { listNotes } from './list-notes';
import { AppSyncResolverEvent } from 'aws-lambda'

const DocumentClient = new DynamoDB.DocumentClient()
AWSXRay.captureAWSClient((DocumentClient as any).service);

export const handler = async (event: AppSyncResolverEvent<any>) => {
    const fieldPath = `${event.info.parentTypeName}.${event.info.fieldName}`
    switch (fieldPath) {
        case "Mutation.createNote":
            return await createNote(event, DocumentClient);
        case "Query.getNote":
            return await getNote(event, DocumentClient);
        case "Query.listNotesByAuthor":
            return await listNotesByAuthor(event, DocumentClient);
        case "Query.listNotes":
            return await listNotes(event, DocumentClient);
        default:
            return null;
    }
}
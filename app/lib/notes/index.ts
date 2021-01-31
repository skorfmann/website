import { Construct } from 'constructs'
import * as aws from '@cdktf/provider-aws'
import * as path from 'path'
import { readFileSync } from 'fs';
import * as iam from 'iam-floyd'
import { Gsi } from './shared'
import { NodejsFunction } from '../esbuild-bundle'
import { Resource } from 'cdktf';
import { AwsServiceRole } from '../iam';

export interface NoteModelProps {
  readonly api: aws.AppsyncGraphqlApi
}

interface CreateResolverOptions {
  typeName: string
  fieldName: string
  dataSource: aws.AppsyncDatasource
  api: aws.AppsyncGraphqlApi
}


export class NoteModel extends Resource {
  public readonly table: aws.DynamodbTable
  public readonly dataSource: aws.AppsyncDatasource

  public static get schema(): string {
    return readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8')
  }

  constructor(scope: Construct, id: string, props: NoteModelProps) {
    super(scope, id);

    const { api } = props;

    this.table = new aws.DynamodbTable(this, 'users', {
      name: 'notes',
      streamEnabled: true,
      streamViewType: 'NEW_AND_OLD_IMAGES',
      hashKey: 'id',
      attribute: [
        { name: 'id', type: 'S' },
        { name: Gsi.byAuthor.partitionKey, type: 'S' },
        { name: Gsi.allByDate.partitionKey, type: 'S' },
        { name: Gsi.byAuthor.sortKey, type: 'S' },
      ],
      billingMode: 'PAY_PER_REQUEST',
      globalSecondaryIndex: [{
        name: 'byUser',
        hashKey: 'id',
        projectionType: 'ALL'
      },
      {
        name: Gsi.byAuthor.name,
        hashKey: Gsi.byAuthor.partitionKey,
        rangeKey: Gsi.byAuthor.sortKey,
        projectionType: 'ALL'
      },
      {
        name: Gsi.allByDate.name,
        hashKey: Gsi.allByDate.partitionKey,
        rangeKey: Gsi.allByDate.sortKey,
        projectionType: 'ALL'
      }]
    })

    const notesRole = new AwsServiceRole(this, 'notes-service-role', {
      service: 'lambda.amazonaws.com',
      policyStatements: [
        new iam.Dynamodb()
          .allow()
          .toBatchWriteItem()
          .toQuery()
          .toPutItem()
          .toUpdateItem()
          .toDeleteItem()
          .toGetItem()
          .on(this.table.arn, `${this.table.arn}/index/*`),
        new iam.Logs()
          .allow()
          .toCreateLogGroup()
          .toCreateLogStream()
          .toPutLogEvents()
          .on('*')
      ]
    })

    const resolverBundle = new NodejsFunction(this, 'notes-model', {
      entry: path.join(__dirname, 'resolver', 'index.ts')
    })

    const resolver = new aws.LambdaFunction(this, 'notes', {
      functionName: 'notes',
      role: notesRole.role.arn,
      environment: [{
        variables: {
          'TABLE_NAME': this.table.name
        }
      }],
      handler: resolverBundle.handler,
      filename: resolverBundle.assetPath,
      sourceCodeHash: resolverBundle.assetHash,
      runtime: resolverBundle.runtime.name,
      memorySize: 512
    })

    const dataSourceRole = new AwsServiceRole(this, 'data-source-role', {
      service: 'appsync.amazonaws.com',
      policyStatements: [
        new iam.Lambda()
          .allow()
          .toInvokeFunction()
          .on(resolver.arn)
      ]
    })

    const dataSource = new aws.AppsyncDatasource(this, 'notes-lambda', {
      apiId: api.id,
      name: 'notesResolver',
      type: 'AWS_LAMBDA',
      serviceRoleArn: dataSourceRole.role.arn,
      lambdaConfig: [{
        functionArn: resolver.arn
      }]
    })


    this.createResolver({api, dataSource, typeName: 'Query', fieldName: 'getNote'})
    this.createResolver({api, dataSource, typeName: 'Query', fieldName: 'listNotes'})
    this.createResolver({api, dataSource, typeName: 'Query', fieldName: 'listNotesByAuthor'})
    this.createResolver({api, dataSource, typeName: 'Mutation', fieldName: 'createNote'})

    this.dataSource = dataSource
  }

  createResolver = (options: CreateResolverOptions) => {
    const { typeName, fieldName, api, dataSource } = options;

    // required until this is merged https://github.com/hashicorp/terraform-provider-aws/pull/14710
    const passthroughTemplate = `{
      "version" : "2017-02-28",
      "operation": "Invoke",
      "payload": {
        "arguments": $util.toJson($ctx.arguments),
        "identity": $util.toJson($ctx.identity),
        "source": $util.toJson($ctx.source),
        "request": $util.toJson($ctx.request),
        "prev": $util.toJson($ctx.prev),
        "info": {
            "selectionSetList": $util.toJson($ctx.info.selectionSetList),
            "selectionSetGraphQL": $util.toJson($ctx.info.selectionSetGraphQL),
            "parentTypeName": $util.toJson($ctx.info.parentTypeName),
            "fieldName": $util.toJson($ctx.info.fieldName),
            "variables": $util.toJson($ctx.info.variables)
        },
        "stash": $util.toJson($ctx.stash)
      }
    }`

    const responseTemplate = `$util.toJson($ctx.result)`

    return new aws.AppsyncResolver(this, `${typeName}-${fieldName}-resolver`, {
      apiId: api.id,
      field: fieldName,
      type: typeName,
      requestTemplate: passthroughTemplate,
      responseTemplate: responseTemplate,
      dataSource: dataSource.name
    })
  }
}

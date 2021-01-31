import { Construct } from 'constructs';
import { Resource } from 'cdktf';
import * as aws from '@cdktf/provider-aws';
import * as iam from 'iam-floyd'
import { NodejsFunction } from '../esbuild-bundle'
import { AwsServiceRole } from '../iam';

export class CognitoAuthentication extends Resource {

  public readonly userPool: aws.CognitoUserPool
  public readonly client: aws.CognitoUserPoolClient

  constructor(scope: Construct, name: string) {
    super(scope, name);

    const table =  new aws.DynamodbTable(this, 'users', {
      name: 'users',
      streamEnabled: true,
      streamViewType: 'NEW_AND_OLD_IMAGES',
      hashKey: 'id',
      attribute: [
        { name: 'id', type: 'S' },
        { name: 'createdAt', type: 'S' }
      ],
      billingMode: 'PAY_PER_REQUEST',
      globalSecondaryIndex: [{
        name: 'byUser',
        hashKey: 'id',
        projectionType: 'ALL'
      },
      {
        name: 'createdAt',
        hashKey: 'createdAt',
        projectionType: 'ALL'
      }]
    })

    const role = new AwsServiceRole(this, 'post-confirmation-role', {
      service: 'lambda.amazonaws.com',
      policyStatements: [
        new iam.Dynamodb()
          .allow()
          .toBatchWriteItem()
          .toPutItem()
          .on(table.arn, `${table.arn}/index/*`),
        new iam.Logs()
          .allow()
          .toCreateLogGroup()
          .toCreateLogStream()
          .toPutLogEvents()
          .on('*')
      ]
    })

    const bundle = new NodejsFunction(this, 'handler');

    const postConfirmation = new aws.LambdaFunction(this, 'post-confirmation', {
      functionName: 'post-confirmation',
      role: role.role.arn,
      environment: [{
        variables: {
          'USERS_TABLE': table.name
        }
      }],
      handler: bundle.handler,
      filename: bundle.assetPath,
      sourceCodeHash: bundle.assetHash,
      runtime: bundle.runtime.name
    })

    const pool = new aws.CognitoUserPool(this, 'Users', {
      name: name,
      lambdaConfig: [{
        postConfirmation: postConfirmation.arn,
        customMessage: postConfirmation.arn
      }],
      aliasAttributes: ['email', 'preferred_username'],
      adminCreateUserConfig: [{
        allowAdminCreateUserOnly: true
      }],
      usernameConfiguration: [{caseSensitive: false}],
    })

    new aws.LambdaPermission(this, 'post-confirmation-userpool-permission', {
      action: "lambda:InvokeFunction",
      principal: 'cognito-idp.amazonaws.com',
      functionName: postConfirmation.functionName,
      sourceArn: pool.arn
    })

    new aws.CognitoUserGroup(this, 'admin', {
      name: 'Admin',
      userPoolId: pool.id
    })

    this.client = new aws.CognitoUserPoolClient(this, 'userPoolClient', {
      name: 'users-pool-client',
      userPoolId: pool.id,
      generateSecret: false
    })

    this.userPool = pool;
  }
}
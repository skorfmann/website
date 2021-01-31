import { Construct } from 'constructs'
import { TerraformStack, RemoteBackend, App, TerraformOutput } from 'cdktf'
import * as aws from '@cdktf/provider-aws'
import * as path from 'path';
import { NoteModel } from './notes'
import { CognitoAuthentication } from './auth'
import { buildSchema } from 'graphql';
import { printSchemaWithDirectives } from '@graphql-tools/utils'
import { writeFileSync } from 'fs';

const appsyncScalars = `
scalar AWSDate
scalar AWSTime
scalar AWSDateTime
scalar AWSTimestamp
scalar AWSEmail
scalar AWSJSON
scalar AWSURL
scalar AWSPhone
scalar AWSIPAddress

directive @aws_subscribe(mutations: [String!]!) on FIELD_DEFINITION

# Allows transformer libraries to deprecate directive arguments.
directive @deprecated(reason: String) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION | ENUM | ENUM_VALUE

directive @aws_auth(cognito_groups: [String!]!) on FIELD_DEFINITION
directive @aws_api_key on FIELD_DEFINITION | OBJECT
directive @aws_iam on FIELD_DEFINITION | OBJECT
directive @aws_oidc on FIELD_DEFINITION | OBJECT
directive @aws_cognito_user_pools(cognito_groups: [String!]) on FIELD_DEFINITION | OBJECT

type Query
type Mutation
`

export class BlogStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const schema = printSchemaWithDirectives(buildSchema(`${appsyncScalars}\n\n${NoteModel.schema}`))
    writeFileSync(path.join(process.cwd(), 'schema.graphql'), schema)

    new aws.AwsProvider(this, 'default', {
      region: 'eu-central-1'
    })

    const auth = new CognitoAuthentication(this, 'auth')

    const api = new aws.AppsyncGraphqlApi(this, 'blog', {
      name: 'blog',
      authenticationType: 'API_KEY',
      additionalAuthenticationProvider: [{
        authenticationType: 'AMAZON_COGNITO_USER_POOLS',
        userPoolConfig: [{
          userPoolId: auth.userPool.id
        }],
      }],
      schema
    })

    const apiKey = new aws.AppsyncApiKey(this, 'apiKey', {
      apiId: api.id
    })

    new NoteModel(this, 'note-model', {
      api
    })

    new TerraformOutput(this, 'apiKeyOutput', {
      value: apiKey.key
    })

    new TerraformOutput(this, 'graphqlEndpoint', {
      value: api.uris('GRAPHQL')
    })

    new TerraformOutput(this, 'cognito', {
      value: auth.userPool.id
    })

    new TerraformOutput(this, 'cognitoWebClientId', {
      value: auth.client.id
    })

    new RemoteBackend(this, {
      hostname: 'app.terraform.io',
      organization: 'skorfmann',
      workspaces: {
        name: 'skorfmann-backend'
      }
    });
  }
}

const app = new App()
new BlogStack(app, 'blog')
app.synth();
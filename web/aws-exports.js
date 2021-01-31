import * as config from '../app/output.json'

export default {
  'aws_appsync_graphqlEndpoint': config.graphqlEndpoint.value,
  'aws_appsync_apiKey': config.apiKeyOutput.value,
  'aws_appsync_region': 'eu-central-1',
  'aws_appsync_authenticationType': 'API_KEY',
  Auth: {
    // (required)- Amazon Cognito Region
    region: 'eu-central-1',

    // (optional) - Amazon Cognito User Pool ID
    userPoolId: config.cognito.value,

    // (optional) - Amazon Cognito Web Client ID (26-char alphanumeric string, App client secret needs to be disabled)
    userPoolWebClientId: config.cognitoWebClientId.value,

    // (optional) - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,

    // (optional) - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    authenticationFlowType: 'USER_SRP_AUTH',
  }
}
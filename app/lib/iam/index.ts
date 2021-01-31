import { PolicyStatement } from 'iam-floyd';
import { Construct } from 'constructs';
import { Resource } from 'cdktf';
import * as aws from '@cdktf/provider-aws';
import * as iam from 'iam-floyd';

export class Policy {
  public static document(statement: PolicyStatement): string {
    return JSON.stringify({
      'Version': "2012-10-17",
      "Statement": [statement]
    })
  }
}

export interface AwsServiceRoleOptions {
  name?: string
  service: string
  policyStatements: iam.PolicyStatement[]
}

export class AwsServiceRole extends Resource {
  public readonly role: aws.IamRole

  constructor(scope: Construct, id: string, props: AwsServiceRoleOptions) {
    super(scope, id)

    const { name = id, service, policyStatements } = props;

    this.role = new aws.IamRole(this, `${name}-role`, {
      name,
      assumeRolePolicy: Policy.document(new iam.Sts()
        .allow()
        .toAssumeRole()
        .forService(service)
        .toJSON())
    })

    const notesPolicy = new aws.IamPolicy(this, `${name}-role-policy`, {
      name: `${name}-role-policy`,
      path: '/',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: policyStatements,
      })
    })

    new aws.IamRolePolicyAttachment(this, `${name}PolicyAttachment`, {
      policyArn: notesPolicy.arn,
      role: this.role.name
    })
  }
}

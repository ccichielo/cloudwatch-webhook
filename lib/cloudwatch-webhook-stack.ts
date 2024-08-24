import * as cdk from "aws-cdk-lib";
import { Alarm, Metric } from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { join } from "path";

export class CloudwatchWebhookStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const webhookLambda = new NodejsFunction(this, "webhookLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "..", "services", "hook.ts"),
    });

    const alarmTopic = new Topic(this, "TSAlarmTopic", {
      displayName: "TsAlarmTopic",
      topicName: "TsAlarmTopic",
    });

    alarmTopic.addSubscription(new LambdaSubscription(webhookLambda));

    const simpleAlarm = new Alarm(this, "Ts-ApiAlarm", {
      metric: new Metric({
        metricName: "custom-error",
        namespace: "Custom",
        period: cdk.Duration.minutes(1),
        statistic: "Sum",
      }),
      evaluationPeriods: 1,
      threshold: 5,
    });

    const topicAction = new SnsAction(alarmTopic);
    simpleAlarm.addAlarmAction(topicAction);
    simpleAlarm.addOkAction(topicAction);
  }
}

import { SNSEvent } from "aws-lambda";

const webHookUrl = "";
async function handler(event: SNSEvent) {
  for (const record of event.Records) {
    const response = await fetch(webHookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `Houston, we have a problem: ${record.Sns.Message}`,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send message: ${response.status} ${response.statusText}`,
      );
    } else {
      console.log("Message sent successfully");
    }
  }
}

export { handler };

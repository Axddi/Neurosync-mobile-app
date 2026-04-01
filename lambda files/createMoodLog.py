import json
import boto3
import time

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MoodLogs')

def lambda_handler(event, context):

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": ""
        }

    try:
        body = json.loads(event.get('body', '{}'))

        user_id = body.get('userId')
        mood = body.get('mood')
        tags = body.get('tags', [])
        if isinstance(tags, list):
            tags = [str(tag) for tag in tags]
        else:
            tags = []
        note = body.get('note', "")

        timestamp = str(int(time.time()))

        item = {
            "pk": f"USER#{user_id}",
            "sk": f"MOOD#{timestamp}",
            "mood": mood,
            "tags": tags,
            "note": note,
            "createdAt": timestamp
        }

        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": json.dumps({"message": "Saved"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }
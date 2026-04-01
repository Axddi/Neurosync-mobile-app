import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MoodLogs')

def lambda_handler(event, context):
    try:
        print("EVENT:", event) 
        params = event.get('queryStringParameters')
        if not params:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing query params"})
            }

        user_id = params.get('userId')
        if not user_id:
            return {
                "statusCo+6de": 400,
                "body": json.dumps({"error": "Missing userId"})
            }

        response = table.query(
            KeyConditionExpression=Key('pk').eq(f"USER#{user_id}"),
            ScanIndexForward=False,
            Limit=10
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps({
                "Items": response.get("Items", [])
            })
        }

    except Exception as e:
        print("ERROR:", str(e)) 
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
import boto3
import os
import json

client = boto3.client("cognito-idp")

def lambda_handler(event, context):
    try:
        response = client.list_users(
            UserPoolId=os.environ["USER_POOL_ID"]
        )

        users = []

        for u in response["Users"]:
            attrs = {a["Name"]: a["Value"] for a in u["Attributes"]}

            users.append({
                "id": attrs.get("sub"),
                "name": attrs.get("preferred_username", "User"),
                "email": attrs.get("email"),
                "role": attrs.get("custom:role")
            })

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(users)
        }

    except Exception as e:
        print("ERROR:", str(e)) 
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
import json

def handler(event, context):
    print("Hello, Netlify Scheduled Functions!")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello, world!')
    }
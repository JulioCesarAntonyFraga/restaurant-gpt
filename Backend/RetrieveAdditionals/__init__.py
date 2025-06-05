import json
import azure.functions as func
from utils.storage import get_additionals

def main(req: func.HttpRequest) -> func.HttpResponse:
    toppings = get_additionals()

    return func.HttpResponse(json.dumps(toppings), mimetype="application/json", status_code=200)

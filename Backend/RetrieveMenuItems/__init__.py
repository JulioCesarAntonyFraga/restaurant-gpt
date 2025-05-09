import json
import azure.functions as func
from utils.storage import get_menu
from utils.auth import verify_token

def main(req: func.HttpRequest) -> func.HttpResponse:
    menu = get_menu()

    return func.HttpResponse(json.dumps(menu), mimetype="application/json", status_code=200)

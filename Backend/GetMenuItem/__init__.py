import json
import azure.functions as func
from utils.storage import get_menu_item
from utils.auth import verify_token

def main(req: func.HttpRequest) -> func.HttpResponse:
    # user = verify_token(req)
    # if not user:
    #     return func.HttpResponse("Unauthorized", status_code=401)
    id = req.route_params.get('id')
    if id:
        menu_item = get_menu_item(id)
        return func.HttpResponse(json.dumps(menu_item), mimetype="application/json", status_code=200)
    else:
        return func.HttpResponse(
             "Required parameters: id",
             status_code=400
        )
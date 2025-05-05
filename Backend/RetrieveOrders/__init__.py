import json
import azure.functions as func
from utils.storage import get_orders
from utils.auth import verify_token

def main(req: func.HttpRequest) -> func.HttpResponse:
    user = verify_token(req)
    if not user:
        return func.HttpResponse("Unauthorized", status_code=401)
    
    order_status = req.params.get('order_status')
    
    orders = get_orders(order_status)

    return func.HttpResponse(json.dumps(orders), mimetype="application/json", status_code=200)

import json
import azure.functions as func
from utils.storage import get_orders

def main(req: func.HttpRequest) -> func.HttpResponse:
    order_status = req.params.get('order_status')
    
    orders = get_orders(order_status)

    return func.HttpResponse(json.dumps(orders), mimetype="application/json", status_code=200)

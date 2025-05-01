import logging
from utils.storage import advance_order_status
import azure.functions as func
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    order_id = req.route_params.get('order_id')
    if order_id:
        order = advance_order_status(order_id)
        return func.HttpResponse(json.dumps(order), mimetype="application/json", status_code=200)
    else:
        return func.HttpResponse(
             "Required parameters: order_id",
             status_code=400
        )

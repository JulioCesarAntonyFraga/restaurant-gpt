import json
from utils.storage import add_menu_item
import azure.functions as func

required_fields = ["name", "price", "available", "category"]
optional_fields = ["description"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    menu_item = req.get_json()

    for key, value in menu_item.items():
        if key not in required_fields and key not in optional_fields:
            return func.HttpResponse(f"Invalid field: {key}", status_code=400)
        if not value and key in required_fields:
            return func.HttpResponse(f"Missing {key}", status_code=400)

    return func.HttpResponse(json.dumps(add_menu_item(menu_item)), status_code=200, mimetype="application/json")

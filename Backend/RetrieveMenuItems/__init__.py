import json
import azure.functions as func
from utils.storage import get_menu, get_additionals, get_toppings
from utils.auth import verify_token

def replace_topping_ids_with_objects(obj):
    topping_ids = obj.get("toppings", [])
    full_toppings = get_toppings()
    toppings_map = {t["id"]: t for t in full_toppings}
    obj["toppings"] = [toppings_map[tid] for tid in topping_ids if tid in toppings_map]
    return obj

def replace_additionals_ids_with_objects(obj):
    additionals_ids = obj.get("additionals", [])
    full_additionals = get_additionals()
    additionals_map = {a["id"]: a for a in full_additionals}
    obj["additionals"] = [additionals_map[aid] for aid in additionals_ids if aid in additionals_map]
    return obj

def main(req: func.HttpRequest) -> func.HttpResponse:
    menu = get_menu()

    for item in menu:
        replace_topping_ids_with_objects(item)
        replace_additionals_ids_with_objects(item)

    return func.HttpResponse(json.dumps(menu), mimetype="application/json", status_code=200)

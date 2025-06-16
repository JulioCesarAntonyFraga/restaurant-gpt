import json
import azure.functions as func
from utils.storage import get_additionals, get_menu_item, get_toppings

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
    # user = verify_token(req)
    # if not user:
    #     return func.HttpResponse("Unauthorized", status_code=401)
    id = req.route_params.get('id')
    if id:
        menu_item = get_menu_item(id)
        if menu_item:
            replace_topping_ids_with_objects(menu_item)
            replace_additionals_ids_with_objects(menu_item)
            return func.HttpResponse(json.dumps(menu_item), mimetype="application/json", status_code=200)
        else:
            return func.HttpResponse("Menu item not found", status_code=404)
    else:
        return func.HttpResponse(
            "Required parameters: id",
            status_code=400
        )

import firebase_admin
from firebase_admin import credentials, firestore 
import uuid
import time
import base64
import os
import os
import base64
import firebase_admin
from firebase_admin import credentials, firestore

cred_path = "/tmp/firebase-credentials.json"

firebase_json_b64 = os.environ.get("FIREBASE_CREDENTIALS_B64")

if firebase_json_b64:
    decoded = base64.b64decode(firebase_json_b64)
    with open(cred_path, "wb") as f:
        f.write(decoded)
else:
    # Executando localmente — usa o arquivo local
    cred_path = "./firebase-credentials.json"

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def get_menu_item(menu_item_id: str) -> dict:
    
    menu_item_ref = db.collection("menu").document(menu_item_id)

    # Get the snapshot first
    menu_item_snapshot = menu_item_ref.get()

    if not menu_item_snapshot.exists:
        raise ValueError(f"Menu item with ID {menu_item_id} not found.")

    # Then convert snapshot to dict
    menu_item = menu_item_snapshot.to_dict()
    menu_item['id'] = menu_item_id

    return menu_item

def start_conversation(phone_number: str) -> str:
    conversation_id = str(uuid.uuid4())
    timestamp = int(time.time())

    doc_ref = db.collection("conversations").document(phone_number).collection("chats").document(conversation_id)
    doc_ref.set({
        "conversation_ended": False,
        "started_at": timestamp,
        "messages": []
    })

    return conversation_id

def add_menu_item(menu_item: dict) -> dict:
    menu_item["id"] = str(uuid.uuid4())
    menu_item["created_at"] = int(time.time())
    menu_item["updated_at"] = int(time.time())
    menu_item["price"] = float(menu_item["price"])

    db.collection("menu").document(menu_item["id"]).set(menu_item)
    return menu_item

def add_topping(topping: dict) -> dict:
    topping["id"] = str(uuid.uuid4())
    topping["created_at"] = int(time.time())
    topping["updated_at"] = int(time.time())

    db.collection("toppings").document(topping["id"]).set(topping)
    return topping

def add_additional(additional: dict) -> dict:
    additional["id"] = str(uuid.uuid4())
    additional["created_at"] = int(time.time())
    additional["updated_at"] = int(time.time())
    additional["price"] = float(additional["price"])

    db.collection("additionals").document(additional["id"]).set(additional)
    return additional

def get_menu(get_all: bool = True) -> list:
    menu_ref = db.collection("menu")
    if menu_ref and not get_all:
        menu_ref = menu_ref.where("available", "==", True)

    return [
        {**doc.to_dict(), "id": doc.id}
        for doc in menu_ref.stream()
    ]

def get_toppings(get_all: bool = True) -> list:
    toppings_ref = db.collection("toppings")
    if toppings_ref and not get_all:
        toppings_ref = toppings_ref.where("available", "==", True)

    return [
        {**doc.to_dict(), "id": doc.id}
        for doc in toppings_ref.stream()
    ]

def get_additionals(get_all: bool = True) -> list:
    additionals_ref = db.collection("additionals")
    if additionals_ref and not get_all:
        additionals_ref = additionals_ref.where("available", "==", True)

    return [
        {**doc.to_dict(), "id": doc.id}
        for doc in additionals_ref.stream()
    ]

def add_message(phone_number: str, conversation_id: str, role: str, content: str):
    doc_ref = db.collection("conversations").document(phone_number).collection("chats").document(conversation_id)
    doc = doc_ref.get()

    if doc.exists:
        data = doc.to_dict()
        messages = data.get("messages", [])
        messages.append({
            "role": role,
            "content": content,
            "timestamp": int(time.time())
        })
        doc_ref.update({
            "messages": messages
        })
    else:
        raise ValueError("Conversation not found")

def end_conversation(phone_number: str, conversation_id: str):
    doc_ref = db.collection("conversations").document(phone_number).collection("chats").document(conversation_id)
    doc_ref.update({
        "conversation_ended": True,
        "ended_at": int(time.time())
    })

def get_active_conversation(phone_number: str):
    chats_ref = db.collection("conversations").document(phone_number).collection("chats")
    query = chats_ref.where("conversation_ended", "==", False).order_by("started_at", direction=firestore.Query.DESCENDING).limit(1).stream()

    for chat in query:
        return chat.id, chat.to_dict()
    
    return None, None

def save_order(
    name: str,
    phone_number: str,
    items: list,
    total: float,
    is_delivery: bool,
    payment_method: str,
    change_to: float = None,
    status: str = "In Progress",
    ordered_at: float = None,
    cep: str = None,
    rua: str = None,
    bairro: str = None,
    numero: str = None,
    cidade: str = None
):
    if ordered_at is None:
        ordered_at = time.time()

    order_number = get_last_order_number() + 1 if get_last_order_number() else 1

    order_ref = db.collection("orders").document()
    order_id = order_ref.id

    order_data = {
        "id": order_id,
        "order_number": order_number,
        "name": name,
        "phone_number": phone_number,
        "total": round(total, 2),
        "is_delivery": is_delivery,
        "payment_method": payment_method,
        "change_to": change_to,
        "status": status,
        "ordered_at": ordered_at,
    }

    if is_delivery:
        order_data.update({
            "cep": cep,
            "rua": rua,
            "bairro": bairro,
            "numero": numero,
            "cidade": cidade
        })

    # Preparar itens
    items_data = []
    for item in items:
        item_data = {
            "id": item["id"],
            "name": item["name"],
            "price": item["price"],
            "amount": item["amount"],
            "observation": item.get("observation", ""),
            "toppings": item.get("toppings", []),        # lista de dicts com id e name
            "additionals": item.get("additionals", [])   # lista de dicts com id, name, price
        }
        items_data.append(item_data)

    order_data["items"] = items_data

    # Salvar com ID fixo
    db.collection("orders").document(order_id).set(order_data)

    return order_data

def get_last_order_number() -> int:
    orders_ref = db.collection("orders").order_by("order_number", direction=firestore.Query.DESCENDING).limit(1).stream()
    for order in orders_ref:
        return order.to_dict()['order_number']
    return None

def get_order(order_id: str) -> dict:
    order_ref = db.collection("orders").document(order_id)

    # Get the snapshot first
    order_snapshot = order_ref.get()

    if not order_snapshot.exists:
        raise ValueError(f"Order with ID {order_id} not found.")

    # Then convert snapshot to dict
    order = order_snapshot.to_dict()
    order['id'] = order_id

    return order

def get_orders(order_status: str = None):
    orders_ref = db.collection("orders")
    if order_status:
        orders_ref = orders_ref.where("status", "==", order_status)

    return [
        {**doc.to_dict(), "id": doc.id}
        for doc in orders_ref.stream()
    ]

def advance_order_status(order_id: str) -> dict:
    order_ref = db.collection("orders").document(order_id)
    order_snapshot = order_ref.get()

    if not order_snapshot.exists:
        raise ValueError(f"Order with ID {order_id} not found.")

    order = order_snapshot.to_dict()
    order['id'] = order_id

    current_status = order.get("status")
    next_status = get_next_status(current_status)

    if next_status is None:
        raise ValueError("Status já está no último estágio.")

    order_ref.update({"status": next_status})
    order['status'] = next_status

    return order

def regress_order_status(order_id: str) -> dict:
    order_ref = db.collection("orders").document(order_id)
    order_snapshot = order_ref.get()

    if not order_snapshot.exists:
        raise ValueError(f"Order with ID {order_id} not found.")

    order = order_snapshot.to_dict()
    order['id'] = order_id

    current_status = order.get("status")
    previous_status = get_previous_status(current_status)

    if previous_status is None:
        raise ValueError("Status já está no primeiro estágio.")

    order_ref.update({"status": previous_status})
    order['status'] = previous_status

    return order


status_order = {
    0: "Pendente",
    1: "Aceito",
    2: "Em andamento",
    3: "Pronto para coleta/entrega",
    4: "A caminho do cliente",
    5: "Coletado/Entregue",
}

def get_next_status(current_status: int) -> int | None:
    if current_status < max(status_order.keys()):
        return current_status + 1
    return None

def get_previous_status(current_status: int) -> int | None:
    if current_status > min(status_order.keys()):
        return current_status - 1
    return None

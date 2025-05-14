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

def get_menu():
    menu_ref = db.collection("menu")
    if menu_ref:
        menu_ref = menu_ref.where("available", "==", True)

    return [
        {**doc.to_dict(), "id": doc.id}
        for doc in menu_ref.stream()
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
    phone_number: str,
    items: list,
    total: float,
    is_delivery: bool,
    address: str,
    payment_method: str,
    change: float = None,
    status: str = "In Progress",
    ordered_at: time = time.time(),
):
    order_data = {
        "number": get_last_order_number() + 1 if get_last_order_number() else 1,
        "phone_number": phone_number,
        "items": items,
        "total": total,
        "is_delivery": is_delivery,
        "address": address,
        "ordered_at": ordered_at,
        "payment_method": payment_method,
        "change": change,
        "status": status
    }

    db.collection("orders").add(order_data)

def get_last_order_number() -> int:
    orders_ref = db.collection("orders").order_by("number", direction=firestore.Query.DESCENDING).limit(1).stream()
    for order in orders_ref:
        return order.to_dict()['number']
    return None

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

    # Get the snapshot first
    order_snapshot = order_ref.get()

    if not order_snapshot.exists:
        raise ValueError(f"Order with ID {order_id} not found.")

    # Then convert snapshot to dict
    order = order_snapshot.to_dict()
    order['id'] = order_id

    current_status = order.get("status")
    next_status = get_next_status(current_status)

    # Update in Firestore
    order_ref.update({"status": next_status})

    # Update local copy to reflect the change
    order['status'] = next_status

    return order

def regress_order_status(order_id: str) -> dict:
    order_ref = db.collection("orders").document(order_id)

    # Get the snapshot first
    order_snapshot = order_ref.get()

    if not order_snapshot.exists:
        raise ValueError(f"Order with ID {order_id} not found.")

    # Then convert snapshot to dict
    order = order_snapshot.to_dict()
    order['id'] = order_id

    current_status = order.get("status")
    next_status = get_previous_status(current_status)

    # Update in Firestore
    order_ref.update({"status": next_status})

    # Update local copy to reflect the change
    order['status'] = next_status

    return order

def get_previous_status(current_status: str) -> str:
    status_order = [
        "In Progress",
        "On the Way to the customer",
        "Ready to take away",
        "Delivered/Picked up"
    ]
    try:
        current_index = status_order.index(current_status)
        previous_index = (current_index - 1) % len(status_order)
        return status_order[previous_index]
    except ValueError:
        return None

def get_next_status(current_status: str) -> str:
    status_order = [
        "In Progress",
        "On the Way to the customer",
        "Ready to take away",
        "Delivered/Picked up"
    ]
    try:
        current_index = status_order.index(current_status)
        next_index = (current_index + 1) % len(status_order)
        return status_order[next_index]
    except ValueError:
        return None
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Optional
from datetime import datetime

cred = credentials.Certificate("./firebase-credentials.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def save_order_to_firestore(
    user_id: str,
    items: list,
    total: float,
    is_delivery: bool,
    address: str,
    ordered_at: str,
    payment_method: str,
    change: float = None,
    order_status: str = "In Progress"
):
    order_data = {
        "user_id": user_id,
        "items": items,
        "total": total,
        "is_delivery": is_delivery,
        "address": address,
        "ordered_at": ordered_at,
        "payment_method": payment_method,
        "change": change,
        "order_status": order_status
    }

    db.collection("orders").add(order_data)

import React from "react";
import { Order } from "./OrderCard"; // Reutiliza a interface

interface OrderItemListProps {
  items: Order["items"];
}

const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
  return (
    <div className="mb-2">
      <strong>Items:</strong>
      <ul className="list-disc list-inside">
        {items.map((item, idx) => (
          <li key={idx}>
            {item.amount}x {item.name}
            <p>{item.observation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderItemList;

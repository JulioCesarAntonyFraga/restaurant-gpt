import { formatTimestamp } from "../utils/orderUtils";

export interface OrderInfoProps {
    phone: string;
    isDelivery: boolean;
    orderedAt: number;
    status: string;
  }
  
  const OrderInfo = ({ phone, isDelivery, orderedAt, status }: OrderInfoProps) => {
    return (
      <div>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Type:</strong> {isDelivery ? "Delivery" : "Take Away"}</p>
       <p><strong>Time:</strong> {formatTimestamp(orderedAt)}</p>
        <p><strong>Status:</strong> {status}</p>
      </div>
    );
  };
  
  export default OrderInfo;
  
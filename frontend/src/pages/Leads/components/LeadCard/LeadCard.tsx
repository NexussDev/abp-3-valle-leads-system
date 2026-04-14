import styles from "./LeadCard.module.css";
import { Lead } from "../../../../types/Lead";

interface Props {
  item: Lead;
  statusColor: string;
}

export default function LeadCard({ item, statusColor }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <img src={item.avatar} className={styles.avatar} />
        <div>
          <div className={styles.name}>{item.name}</div>
          <div className={styles.car}>{item.car}</div>
        </div>
      </div>

      <div className={styles.middle}>
        <span className={styles.price}>R$ {item.price}</span>
        <span className={styles.time}>{item.time}</span>
      </div>

      <div className={styles.footer}>
        <span 
          className={styles.status}
          style={{ backgroundColor: statusColor }}
        >
          {item.status}
        </span>

        <img src={item.image} className={styles.carImage} />
      </div>
    </div>
  );
}
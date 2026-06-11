import styles from "./LeadCard.module.css";
import { Lead } from "../../../../types/Lead";

interface Props {
  item: Lead;
  statusColor: string;
}

export default function LeadCard({ item, statusColor }: Props) {
  let importanciaClass = "";

  if (item.temperatura === "quente") {
    importanciaClass = styles.leadEstourando;
  } else if (item.temperatura === "frio") {
    importanciaClass = styles.leadRecente;
  }

  return (
    <div className={`${styles.card} ${importanciaClass}`}>
      <div className={styles.top}>
        <img src={item.avatar} className={styles.avatar} alt={item.name} />
        <div>
          <div className={styles.car}>{item.car}</div>
<div className={styles.name}>{item.name}</div>

          {item.temperatura && (
            <div className={`${styles.temperatureBadge} ${styles[item.temperatura]}`}>
              {item.temperatura === "quente" ? "❤️ Quente" : item.temperatura === "frio" ? "❄️ Frio" : "🔥 Morno"}
            </div>
          )}
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

        <img src={item.image} className={styles.carImage} alt={item.car} />
      </div>
    </div>
  );
}
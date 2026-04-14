import styles from "./KanbanColumn.module.css";
import LeadCard from "../LeadCard/LeadCard";
import { Column } from "../../../../types/Column";

interface ColumnProps {
  column: Column;
}

export default function KanbanColumn({ column }: ColumnProps) {
  return (
    <div className={styles.column}>
      
      <div
        className={styles.header}
        style={{ backgroundColor: column.color }}
      >
        <div className={styles.title}>{column.title}</div>
        <div className={styles.value}>R$ {column.totalValue}</div>
      </div>

      <div className={styles.cards}>
        {column.items.map((item) => (
          <LeadCard
            key={item.id}
            item={item}
            statusColor={column.color}
          />
        ))}
      </div>

    </div>
  );
}
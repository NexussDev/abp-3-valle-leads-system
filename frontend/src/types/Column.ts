import { Lead } from "./Lead";

export interface Column {
  id: number;
  title: string;
  color: string;
  totalValue: number;
  items: Lead[];
}
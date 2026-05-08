import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dados Mockados Estruturados
const DATA_ORIGEM = [
  { name: 'Instagram', value: 400, color: '#E1306C' },
  { name: 'WhatsApp', value: 300, color: '#25D366' },
  { name: 'Facebook', value: 200, color: '#1877F2' },
  { name: 'Site', value: 100, color: '#3b82f6' },
];

const DATA_CONVERSAO = [
  { name: 'Instagram', conversao: 12 },
  { name: 'WhatsApp', conversao: 18 },
  { name: 'Facebook', conversao: 8 },
  { name: 'Site', conversao: 15 },
];

export default function LeadCharts() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
      
      {/* Gráfico 1: Origem dos Leads */}
      <div style={cardStyle}>
        <h4 style={titleStyle}>Origem dos Leads</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={DATA_ORIGEM} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {DATA_ORIGEM.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2: Conversão por Origem (%) */}
      <div style={cardStyle}>
        <h4 style={titleStyle}>Conversão por Origem (%)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={DATA_CONVERSAO}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: '#f1f5f9'}} />
            <Bar dataKey="conversao" fill="#38a169" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#4a5568',
  marginBottom: '15px'
};
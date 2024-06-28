import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { PLChartProps } from '~/types/component.types';

export const ChartColorsMap = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffc658',
  orange: '#ff7300',
  purple: '#82ca9d',
  black: 'black',
  gray: 'rgb(212 212 212)',
}

export function calculateChartCellColor() {
}
export function PLBarChart({data, darkMode } : PLChartProps) {
  const incompleteColor =  darkMode ? 'black' : 'rgb(212 212 212)';
  const colors = ['#ff0000', '#82ca9d', '#ffc658', '#6F8FAF']; // Add as many colors as you need

  if (!data.length) {
    return <div className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>Insufficient data. Turn on a sprint generation to see analytics.</div>
  }


  return (
    <ResponsiveContainer height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3"opacity={darkMode ? 0.2 : 1}/>
        <XAxis dataKey="name" />
        <YAxis dataKey="total"/>
        {/* <Bar dataKey="incomplete" fill={incompleteColor} stackId="a" /> */}
        {/* {data.map((entry, index) => (
          <Bar
            key={`bar-${index}`}
            dataKey="incomplete"
            fill={colors[index % colors.length]} // Cycle through colors array
            stackId="a"
          />
        ))} */}
        <Bar dataKey="incomplete" stackId="a" opacity={0.75}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
        ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
}
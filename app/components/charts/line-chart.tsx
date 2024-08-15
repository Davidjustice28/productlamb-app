import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PLChartProps } from '~/types/component.types';

export function PLLineChart({data } : PLChartProps) {
  if (data.length < 2) {
    return <div className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>Insufficient data. {!data.length ? 'Turn on a sprint generation to see analytics' : 'Chart will be available next sprint'}.</div>
  }

  const totals = data.reduce((acc, curr) => {
    acc.bugs += curr.bugs
    acc.features += curr.features
    acc.chores += curr.chores
    acc.others += curr.other
    return acc
  } , {bugs: 0, features: 0, chores: 0, others: 0})

  const averages = {
    bugs: Math.round(totals.bugs / data.length),
    features: Math.round(totals.features / data.length),
    chores: Math.round(totals.chores / data.length),
    others: Math.round(totals.others / data.length)
  }

  const message = `Looks like you average ${averages.bugs} bug, ${averages.features} feature, ${averages.chores} chore, and ${averages.others} other tasks per sprint.`
  return (
    <div className='h-full group relative'>
      <ResponsiveContainer height="100%">
        <LineChart
          data={data.slice(0,8)}
          margin={{ top: 10, bottom: 0, right: 30}}
        >
          <Legend/>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="name"/>
          <YAxis/>
          <Line type="monotone" dataKey="bugs" stroke="#ff0000" activeDot={{ r: 8 }} strokeWidth={3}/>
          <Line type="monotone" dataKey="features" stroke="#82ca9d" strokeWidth={3}/>
          <Line type="monotone" dataKey="chores" stroke="#ffc658" activeDot={{ r: 8 }} strokeWidth={3}/>
          <Line type="monotone" dataKey="others" stroke="#6F8FAF" strokeWidth={3}/>
        </LineChart>
      </ResponsiveContainer>
      <div className='absolute hidden group-hover:visible w-1/3 h-1/3 shadow-md rounded-md bg-orange-400 dark:bg-[#F28C28] text-white dark:text-neutral-100 group-hover:flex group-hover:flex-col justify-center items-center top-10 left-1/3 p-3'>
        <p className='text-center font-bold underline'>Chart Summary</p>
        <p className='text-center'>{message}</p>
      </div>
    </div>
  );  
}


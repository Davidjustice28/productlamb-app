import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export type PLAreaChartProps = {
  data: Array<{name: string, taskCount: number}>,
  xKey: string,
  yKey: string,
  fill: string,
  opacity?: number,
  tooltip?: React.ReactNode,
  darkMode?: boolean,
  chart_type: 'task-assigned' | 'completed-percentage' | 'points-completed'
  [key: string]: any
};

export type PLBarChartProps = {
  data: Array<{name: string, total: number, incomplete: number, completed: number}>,
  darkMode?: boolean
};

export function PLAreaChart<T=any>(props: PLAreaChartProps) {
  const { data, xKey, yKey, fill, opacity=0.2, tooltip=false, darkMode} = props;
  if (data.length < 2) {
    return <div className='dark:text-neutral-400 text-neutral-600 w-full h-full flex items-center justify-center'>Insufficient data. {!data.length ? 'Turn on a sprint generation to see analytics' : 'Chart will be available next sprint'}.</div>
  }

  const stroke = fill
  const totals = data.reduce((acc, curr) => {
    acc.total += curr.taskCount
    return acc
  } , {total: 0})

  let message = ''

  if (props.chart_type === 'task-assigned') {
    message = Number.isNaN(totals.total / data.length) ? 'Looks like you have not assigned any tasks.' : `Looks like on average, you assigned out ${Math.round(totals.total / data.length)} tasks per sprint.`
  } else if (props.chart_type === 'completed-percentage') {
    message = Number.isNaN(totals.total / data.length) ? 'Looks like you have not completed any tasks.' : `Looks like you completed on average ${Math.round(totals.total / data.length)}% of your assigned work per sprint.`
  } else {
    message = Number.isNaN(totals.total / data.length) ? 'Looks like you have not completed any tasks.' : `Looks like you completed on average ${Math.round(totals.total / data.length)} points per sprint.`
  }
  return (
    <div className='h-full group relative'>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={darkMode ? opacity : 1}/>
          <XAxis dataKey={xKey} />
          <YAxis />
          {tooltip && <Tooltip/>}
          <Area type="monotone" dataKey={yKey} stroke={stroke} fill={fill} />
        </AreaChart>
      </ResponsiveContainer>
      <div className='absolute hidden group-hover:visible w-1/3 mx-h-1/3 shadow-md rounded-md bg-orange-400 dark:bg-[#F28C28] text-white dark:text-neutral-100 group-hover:flex group-hover:flex-col justify-center items-center top-10 left-1/3 p-3'>
        <p className='text-center font-bold underline'>Chart Summary</p>
        <p className='text-center'>{message}</p>
        </div>
    </div>
  );
  
}
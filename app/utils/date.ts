import dayjs from 'dayjs'
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

export function formatUnixDate(unixDate: number) {
  // Extend DayJS module.
  dayjs.extend(LocalizedFormat)

  if (typeof unixDate === 'number') return dayjs.unix(unixDate).format('LLL')
}

export function hasUnixDateExpired(date: number) {
  // Extend DayJS module.
  dayjs.extend(IsSameOrAfter)

  const unixDate = dayjs.unix(date)
  const hasExpired = dayjs().isSameOrAfter(unixDate, 'm')

  return hasExpired
}

export function calculateTimeLeft(start?: string, end?: string, pastDueMessage: 'Past Due' | 'Error' | 'Expired' = 'Past Due') {
  if (!start || !end) {
    return {type: 'time', count: 'N/A'}
  }
  const endDate = new Date(end!)
  const today = new Date()
  const daysLeft = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  const hoursLeft = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 3600))
  const minutesLeft = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60))
  return  daysLeft >= 1 ?{type: 'days', count: daysLeft} : hoursLeft >= 1 ? {type: 'hours', count: hoursLeft} : minutesLeft >= 1 ? {type: 'minutes', count: minutesLeft} : {type: 'time', count: pastDueMessage}
}
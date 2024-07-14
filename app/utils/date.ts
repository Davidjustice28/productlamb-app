import dayjs from 'dayjs'
import IsSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import moment from 'moment-timezone';

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

export function calculateTimeLeft(timezone: string, start?: string, end?: string, pastDueMessage: 'Past Due' | 'Error' | 'Expired' = 'Past Due') {
  if (!start || !end) {
    return {type: 'time', count: 'N/A'}
  }

  const now = moment().tz(timezone);
  const cutoff = moment.utc(end).clone().tz(timezone);
  const daysLeft = cutoff.diff(now, 'days');
  const hoursLeft = cutoff.diff(now, 'hours');
  const minutesLeft = cutoff.diff(now, 'minutes');
  return  daysLeft >= 1 ?{type: 'days', count: daysLeft} : hoursLeft >= 1 ? {type: 'hours', count: hoursLeft} : minutesLeft >= 1 ? {type: 'minutes', count: minutesLeft} : {type: 'time', count: pastDueMessage}
}
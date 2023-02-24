import moment from 'moment'
import { getDateForLastOccurence } from 'utils/format'

export function useDateForLastOccurence() {
  const diffTime = getDateForLastOccurence('Thurs')
  const endTimestamp = moment.utc(moment(diffTime).format('YYYY-MM-DD 00:00:00')).unix()
  const startTimestamp = moment
    .utc(
      moment(diffTime)
        .subtract(7, 'days')
        .format('YYYY-MM-DD 00:00:00')
    )
    .unix()
  return { startTimestamp, endTimestamp }
}

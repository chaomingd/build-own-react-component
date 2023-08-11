import {TransitionProps, ETransitionStatus} from './type'

const DEFAULT_DURATION = 300;
export function getDuration({
  duration,
  status
}: {
  duration?: TransitionProps['duration'];
  status: ETransitionStatus
}) {
  let dur: number;
  if (duration === undefined) {
    dur = DEFAULT_DURATION;
  } else if (typeof duration === 'number') {
    dur = duration;
  } else {
    dur = duration[status] || DEFAULT_DURATION;
  }
  return dur;
}

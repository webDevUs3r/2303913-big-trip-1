import { SortType } from '../const';
import { getPointsDateDifference, getPointsDurationDifference, getPointsPriceDifference } from './point';

const sort = {
  [SortType.DAY]: (points) => points.sort(getPointsDateDifference),
  [SortType.PRICE]: (points) => points.sort(getPointsPriceDifference),
  [SortType.TIME]: (points) => points.sort(getPointsDurationDifference),
  [SortType.EVENT]: () => {},
  [SortType.OFFER]: () => {},
};

export {sort};

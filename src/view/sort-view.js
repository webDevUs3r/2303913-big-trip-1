import AbstractView from '../framework/view/abstract-view';
import { DISABLED_SORT_TYPE, SortType } from '../const';
import { capitalize } from '../utils/point';

function createSortItem({type, isChecked, isDisabled}) {

  return `<div class="trip-sort__item  trip-sort__item--${type}">
              <input
                id="sort-${type}"
                class="trip-sort__input  visually-hidden"
                type="radio" name="trip-sort"
                value="sort-${type}"
                ${isChecked ? 'checked' : ''}
                ${isDisabled ? 'disabled' : ''}
              >
              <label
                class="trip-sort__btn"
                for="sort-${type}"
                data-sort-type="${type}"
              >
                ${capitalize(type)}
              </label>
            </div>`;
}

function createSortTemplate({sortMap}) {

  const sortItemsTemplate = sortMap.map((sortItem) => createSortItem(sortItem)).join('');

  return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            ${sortItemsTemplate}
          </form>`;
}

const disabledSortType = {
  DAY: true,
  EVENT: false,
  PRICE: true,
  TIME: true,
  OFFER: false,
};

export default class SortView extends AbstractView {
  #handleSortTypeChange = null;
  #sortMap = null;

  constructor({sortType, onSortTypeChange}) {
    super();

    this.#handleSortTypeChange = onSortTypeChange;

    this.#sortMap = Object.values(SortType)
      .map((type) => ({
        type,
        isChecked: type === sortType,
        isDisabled: !disabledSortType[type.toUpperCase()],
      }));

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate({sortMap: this.#sortMap});
  }

  #sortTypeChangeHandler = (evt) => {

    if (DISABLED_SORT_TYPE.has(evt.target.dataset.sortType)) {
      return;
    }

    if (evt.target.dataset.sortType) {
      this.#handleSortTypeChange(evt.target.dataset.sortType);
    }
  };
}

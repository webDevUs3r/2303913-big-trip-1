import { render, replace, remove } from '../framework/render';
import EventListView from '../view/event-list-view';
import NoPointView from '../view/no-point-view';
import SortView from '../view/sort-view';
import PointPresenter from './point-presenter';
import {updateItem} from '../utils/common';
import { SortType } from '../const';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { sort } from '../utils/sort';

dayjs.extend(duration);

export default class TripPresenter {
  #tripContainer = null;
  #pointsModel = null;
  #offersModel = null;
  #destionationsModel = null;

  #sortComponent = null;
  #pointListComponent = new EventListView();
  #noPointsComponent = new NoPointView();

  #points = [];
  #pointsPresenters = new Map();

  #currentSortType = SortType.DAY;
  #sourcedPoints = [];

  constructor({tripContainer, pointsModel, offersModel, destionationsModel}) {
    this.#tripContainer = tripContainer;
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destionationsModel = destionationsModel;

    this.#points = [...this.#pointsModel.get()];
    this.#sourcedPoints = [...this.#pointsModel.get()];

    this.#points = sort[SortType.DAY]([...this.#pointsModel.get()]);
    this.#sourcedPoints = sort[SortType.DAY]([...this.#pointsModel.get()]);
  }

  init() {
    this.#renderTripBoard();
  }

  #renderPoint({point, offers, destination, destinations}) {
    const pointPresenter = new PointPresenter({
      pointListComponent: this.#pointListComponent.element,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init({point, offers, destination, destinations});
    this.#pointsPresenters.set(point.id, pointPresenter);
  }

  #renderPoints() {
    this.#points
      .forEach((point) => this.#renderPoint({
        point,
        offers: this.#offersModel.getByType(point.type),
        destination: this.#destionationsModel.getById(point.destination),
        destinations: this.#destionationsModel.get(),
      }));
  }

  #handleModeChange = () => {
    this.#pointsPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#sourcedPoints = updateItem(this.#sourcedPoints, updatedPoint);

    this.#pointsPresenters.get(updatedPoint.id).init({
      point: updatedPoint,
      offers: this.#offersModel.getByType(updatedPoint.type),
      destination: this.#destionationsModel.getById(updatedPoint.destination),
      destinations: this.#destionationsModel.get(),
    });
  };

  #sortPoints(sortType) {
    this.#currentSortType = sortType;
    this.#points = sort[this.#currentSortType](this.#points);
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    // - Сортируем задачи
    this.#sortPoints(sortType);
    // - Очищаем список
    this.#clearPointList();
    // - Рендерим список заново
    this.#renderPointList();
  };

  #renderSort() {
    const prevSortComponent = this.#sortComponent;

    this.#sortComponent = new SortView({
      sortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    if (prevSortComponent) {
      replace(this.#sortComponent, prevSortComponent);
      remove(prevSortComponent);
    } else {
      render(this.#sortComponent, this.#tripContainer);
    }
  }

  #renderNoPoints() {
    render(this.#noPointsComponent, this.#tripContainer);
  }

  #clearPointList() {
    this.#pointsPresenters.forEach((presenter) => presenter.destroy());
    this.#pointsPresenters.clear();
  }

  #renderPointList() {
    render(this.#pointListComponent, this.#tripContainer);

    this.#renderPoints();
  }

  #renderTripBoard() {
    if (this.#points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderPointList();
  }
}

import {
  Component,
  EntityRef,
  EntitySet,
} from 'ape-ecs';

export class GlobalState extends Component {
  static properties = {
    nextUnitId: 0,
    nextPathRequestId: 2000,
  };
};

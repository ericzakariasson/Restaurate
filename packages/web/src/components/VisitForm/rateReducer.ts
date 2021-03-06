import { createInitialRateState } from './rateHelper';
import { rateNodes } from 'constants/rate.constants';

export interface SetRatePayload {
  score: number;
  name: string;
  parent?: string;
}

export interface SetStatePayload {
  rateState: ReducerState;
}

export interface RateNode {
  order: number;
  name: string;
  label: string;
  score: number | null;
  children?: RateNode[];
}

export interface ReducerState {
  food: RateStateNode;
  service: RateStateNode;
  environment: RateStateNode;
  experience: RateStateNode;
  [key: string]: RateStateNode;
}

export interface RateStateNode {
  order: number;
  name: string;
  label: string;
  score: number | null;
  controlled: boolean;
  children?: {
    [key: string]: RateStateNode;
  };
}

type ActionType = 'SET_RATE' | 'SET_STATE';
type Payload = SetRatePayload | SetStatePayload;

interface ReducerAction {
  type: ActionType;
  payload: Payload;
}

export const initialState = createInitialRateState(rateNodes);

export function rateReducer(
  state: ReducerState,
  action: ReducerAction
): ReducerState {
  switch (action.type) {
    case 'SET_RATE':
      const {
        name,
        score,
        parent: parentName
      } = action.payload as SetRatePayload;

      if (parentName) {
        const parent = state[parentName];
        const child = parent.children && parent.children[name];

        const updatedChild = { ...child, score };

        const updatedParent = {
          ...parent,
          controlled: true,
          children: {
            ...parent.children,
            [name]: updatedChild
          }
        };

        return {
          ...state,
          [parentName]: updatedParent
        };
      }

      const node = state[name];

      const updatedNode = {
        ...node,
        controlled: false,
        score
      };

      return {
        ...state,
        [name]: updatedNode
      };
    case 'SET_STATE':
      const { rateState } = action.payload as SetStatePayload;
      return rateState;
    default:
      throw new Error();
  }
}

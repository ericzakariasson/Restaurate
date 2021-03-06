import { PreviewImage } from 'components/UploadImage/UploadImages';
import { rateNodes } from 'constants/rate.constants';
import { Rate, VisitFragment, VisitImageFragment } from 'graphql/types';
import { useArray } from 'hooks';
import * as React from 'react';
import { calculateAverageScore, createInitialRateState } from './rateHelper';
import {
  RateNode,
  rateReducer,
  ReducerState,
  SetRatePayload,
  SetStatePayload
} from './rateReducer';

export interface Handlers {
  addOrder: (name: string) => void;
  removeOrder: (name: string) => void;
  setComment: (text: string) => void;
  setVisitDate: (date: Date) => void;
  setScore: (payload: SetRatePayload) => void;
  setTakeAway: (value: boolean) => void;
  setPrivate: (value: boolean) => void;
  onPreviewImagesChange: (images: PreviewImage[]) => void;
}

export interface Values {
  orders: string[];
  comment: string;
  visitDate: Date;
  rateState: ReducerState;
  averageScore: number | null;
  isTakeAway: boolean;
  isPrivate: boolean;
  previewImages: PreviewImage[];
  images: VisitImageFragment[];
}

interface UseVisitForm {
  handlers: Handlers;
  values: Values;
  isValid: boolean;
}

type UseVisitFormInitialValues = VisitFragment | null;

const transformRateToRateNode = (rate: Rate): RateNode => {
  const children =
    rate.children && rate.children !== null
      ? rate.children.map(transformRateToRateNode)
      : undefined;

  const n = rateNodes.find(n => n.name === rate.name);

  const node: RateNode = {
    order: n!.order,
    name: rate.name,
    label: n!.label,
    score: rate.score,
    children
  };

  return node;
};

export function useVisitForm(
  initialValues?: UseVisitFormInitialValues
): UseVisitForm {
  const [orders, addOrder, removeOrder, setOrders] = useArray<string>();
  const [comment, setComment] = React.useState('');
  const [visitDate, setVisitDate] = React.useState(new Date());

  const [isPrivate, setIsPrivate] = React.useState(false);
  const [isTakeAway, setIsTakeAway] = React.useState(false);

  const [previewImages, setPreviewImages] = React.useState<PreviewImage[]>([]);
  const [images, setImages] = React.useState<VisitImageFragment[]>([]);

  const initialRateState = createInitialRateState(rateNodes);
  const [rateState, dispatch] = React.useReducer(rateReducer, initialRateState);

  const setRateState = (payload: SetStatePayload) =>
    dispatch({ type: 'SET_STATE', payload });

  const setScore = (payload: SetRatePayload) =>
    dispatch({ type: 'SET_RATE', payload });

  const averageScore = calculateAverageScore(rateState);

  const onPreviewImagesChange = React.useCallback(
    (previewImages: PreviewImage[]) => setPreviewImages(previewImages),
    []
  );

  React.useEffect(() => {
    if (initialValues) {
      setOrders(initialValues.orders.map(o => o.title));
      setComment(initialValues.comment || '');
      setVisitDate(initialValues.visitDate);

      const mappedRatings = initialValues.ratings.map(transformRateToRateNode);
      const unmapped = rateNodes.filter(n =>
        mappedRatings.some(r => r.name !== n.name)
      );
      const all = [...mappedRatings, ...unmapped].sort(p => p.order);
      const rs = createInitialRateState(all);

      setRateState({ rateState: rs });
      setIsPrivate(initialValues.private);
      setIsTakeAway(initialValues.takeAway);
      setPreviewImages(
        initialValues.images.map(image => ({
          orders: image.orders?.map(order => order.title) ?? [],
          src: image.url,
          publicId: image.publicId,
          name: image.publicId
        }))
      );
      setImages(initialValues.images);
    }
  }, [initialValues, setOrders]);

  const handlers: Handlers = {
    addOrder,
    removeOrder,
    setComment,
    setVisitDate,
    setScore,
    setPrivate: setIsPrivate,
    setTakeAway: setIsTakeAway,
    onPreviewImagesChange
  };

  const values: Values = {
    orders,
    comment,
    visitDate,
    rateState,
    averageScore,
    isPrivate,
    isTakeAway,
    previewImages,
    images
  };

  const isValid = Boolean(averageScore && averageScore > 0);

  return { handlers, values, isValid };
}

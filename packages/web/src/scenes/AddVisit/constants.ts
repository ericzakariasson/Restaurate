import { RateNode } from './types/visit';

export const rateNodes: RateNode[] = [
  {
    order: 0,
    label: 'Mat',
    name: 'food',
    score: null,
    children: [
      {
        order: 0,
        name: 'taste',
        label: 'Smak',
        score: null
      },
      {
        order: 1,
        name: 'quality',
        label: 'Kvalitet',
        score: null
      }
    ]
  },
  {
    order: 1,
    name: 'service',
    label: 'Service',
    score: null
  },
  {
    order: 2,
    name: 'environment',
    label: 'Miljö',
    score: null
  },
  {
    order: 3,
    name: 'experience',
    label: 'Upplevelse',
    score: null
  }
];

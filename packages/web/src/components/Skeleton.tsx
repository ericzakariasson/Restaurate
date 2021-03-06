import * as React from 'react';
import { Card } from './Card';
import styled from 'styled-components';

const Wrapper = styled(Card)`
  display: flex;
  justify-content: space-between;
`;

const Left = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Right = styled.div`
  width: 20%;
`;

interface LineProps {
  height: number;
  width: number;
}

const Line = styled.div<LineProps>`
  width: ${p => p.width}%;
  height: ${p => p.height}px;
  background: #eee;
  border-radius: 0.25rem;
`;

interface SkeletonCardProps {
  nameWidth?: number;
  addressWidth?: number;
}

export const SkeletonCard = ({
  nameWidth = randomNumberBetween(50, 90),
  addressWidth = randomNumberBetween(40, 80)
}: SkeletonCardProps) => {
  return (
    <Wrapper>
      <Left>
        <Line height={18} width={nameWidth} />
        <Line height={12} width={addressWidth} />
      </Left>
      <Right>
        <Line height={54} width={100} />
      </Right>
    </Wrapper>
  );
};

const randomNumberBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const SkeletonCards = ({ count }: { count: number }) => (
  <>
    {Array.from({ length: count }, (_, i: number) => (
      <SkeletonCard key={i} />
    ))}
  </>
);

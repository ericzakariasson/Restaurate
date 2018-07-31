import React from 'react';
import styled from 'styled-components';

const HamburerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${p => p.isOpen ? `rgba(0,0,0,0.1)` : 'none'};
  transition: ${p => p.theme.transition};
  height: 30px;
  width: 30px;
  border-radius: 50%;
  position: relative;
`;

const HamburgerIngredient = styled.span`
  display: block;
  width: ${p => p.isOpen ? 19 : 23}px;
  border-radius: 50px;
  height: 2px;
  background: ${p => p.theme.action};
  transition: ${p => p.theme.transition};
  transform-origin: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &:first-child {
    transform: ${p => p.isOpen ? `translate(-50%, -50%) rotate(45deg)` : 'translate(-50%, 4px);'}
  }
  
  &:last-child {
    transform: ${p => p.isOpen ? `translate(-50%, -50%) rotate(-45deg)` : 'translate(-50%, -4px);'}
  }
`;

const Hamburger = ({ isOpen, onClick }) => (
  <HamburerWrapper onClick={onClick} isOpen={isOpen}>
    <HamburgerIngredient isOpen={isOpen} />
    <HamburgerIngredient isOpen={isOpen} />
  </HamburerWrapper>
)

export default Hamburger;
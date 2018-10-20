import React, { Component, Fragment } from 'react';
import styled from 'styled-components';

import { Trail, animated, config } from 'react-spring';

import ResultByType from './ResultByType';
import ResultList from './ResultList';

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
`;

export const NoResults = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-weight: 400;
  color: #CCC;
  margin: 40px 0;
`;

const ListWrapper = styled.div`
  display: flex;
  transform: translateX(-${p => p.index * 100}%);
  transition: all 0.5s cubic-bezier(0.42,0,0.1,1.05);
  align-items: center;
`;

const types = ['Restaurang', 'Cafe'];

class ListWithType extends Component {

  state = {
    selectedType: types[0],
  }

  selectType = selectedType => this.setState({ selectedType });

  render() {
    const { open, loading, restaurants, cafes, onSelect } = this.props;

    const { selectedType } = this.state;

    if (open && loading) {
      return (
        <h1>Laddar</h1>
      )
    }

    if (restaurants.length === 0 && cafes.length === 0) {
      return (
        <NoResults>Inga resultat</NoResults>
      )
    }

    const index = types.findIndex(type => type === selectedType);

    return (
      <Wrapper>
        <ResultByType types={types} select={this.selectType} selected={selectedType} />
        <ListWrapper index={index}>
          <ResultList type="restaurang" results={restaurants} onSelect={onSelect.bind(null, 'restaurant')} />
          <ResultList type="café" results={cafes} onSelect={onSelect.bind(null, 'cafe')} />
        </ListWrapper>
      </Wrapper>
    )
  }
}

export default ListWithType;
import { useInfiniteScroll } from 'hooks';
import * as React from 'react';
import styled from 'styled-components';
import { Loading, Page } from '../../components';
import { NoResult } from '../../components/NoResult';
import { SkeletonCards } from '../../components/Skeleton';
import { useMePlacesQuery, useMeQuery } from '../../graphql/types';
import { myPlaceRoute } from '../../routes';
import { GeneralError } from '../Error/GeneralError';
import { PlaceListItem } from './component/PlaceListItem';
import { updateQuery } from './updateQuery';

const PlaceList = styled.ul`
  list-style: none;
`;

const Loader = styled.div`
  width: 100%;
`;

export const MePlacesScene = () => {
  const { data: meData } = useMeQuery();
  const { data, loading, error, fetchMore } = useMePlacesQuery({
    variables: { page: 0 },
    notifyOnNetworkStatusChange: true
  });

  const loadMore = React.useCallback(
    (nextPage: number) =>
      fetchMore({
        variables: { page: nextPage },
        updateQuery
      }),
    [fetchMore]
  );

  const { ref, hasFetchedMore } = useInfiniteScroll({
    isFetching: loading,
    pageInfo: data?.places.pageInfo,
    loadMore
  });

  if (error) {
    return <GeneralError />;
  }

  if (loading && !hasFetchedMore) {
    return (
      <Page title="Besök" subTitle="- besök">
        <SkeletonCards count={7} />
      </Page>
    );
  }

  const placeCount = meData?.me?.placeCount;

  return (
    <Page title="Ställen" subTitle={formatPlaceCount(placeCount)}>
      {data?.places.data.length === 0 ? (
        <NoResult label="ställen" />
      ) : (
        <>
          {/* <Filter /> */}
          <PlaceList>
            {data?.places.data.map(place => (
              <PlaceListItem
                key={place.providerId}
                name={place.details?.name}
                address={place.details?.location.address.formatted}
                visitCount={place.visitCount}
                averageScore={place.averageScore}
                to={myPlaceRoute({ providerId: place.providerId })}
                tags={place.tags}
              />
            ))}
          </PlaceList>
          <Loader ref={ref}>{loading && <Loading fullscreen={false} />}</Loader>
        </>
      )}
    </Page>
  );
};

const formatPlaceCount = (placeCount?: number) =>
  placeCount ? `${placeCount} ställe${placeCount !== 1 ? 'n' : ''}` : undefined;

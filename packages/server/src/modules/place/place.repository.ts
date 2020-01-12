import { Repository, EntityRepository } from 'typeorm';
import { Place } from './place.entity';
import { Visit } from '../visit/visit.entity';
import * as DataLoader from 'dataloader';

@EntityRepository(Place)
export class PlaceRepository extends Repository<Place> {
  private loader: DataLoader<number, Place> = new DataLoader(async placeIds => {
    const places = await this.findByIds(placeIds as number[]);
    return places;
  });

  private scoreLoader: DataLoader<number, number | null> = new DataLoader(
    async placeIds => {
      const scores = await this.getAverageScoreByIds(placeIds);
      const mapped = scores.map(({ round }) => round);
      return mapped;
    }
  );

  findByUserId = (userId: number) =>
    this.createQueryBuilder('place')
      .select('*')
      .where('place.userId = :userId', { userId })
      .orderBy('place.createdAt', 'DESC')
      .getRawMany();

  findById = (placeId: number) => this.loader.load(placeId);

  findVisitsById = (placeId: number, options: VisitOptions): Promise<Visit[]> =>
    this.createQueryBuilder('place')
      .innerJoin('place.visits', 'visit', 'visit.placeId = :placeId', {
        placeId
      })
      .take(options.limit)
      .skip(options.skip)
      .orderBy('visit.visitDate')
      .addOrderBy('visit.createdAt')
      .getRawMany();

  getAverageScoreById = (placeId: number) => this.scoreLoader.load(placeId);

  getAverageScoreByIds = (
    placeIds: readonly number[]
  ): Promise<AverageScore[]> =>
    this.createQueryBuilder('place')
      .select('ROUND(AVG("visit"."score")::numeric, 2)')
      .leftJoin('place.visits', 'visit', 'visit.placeId = place.id')
      .where('place.id IN (:...placeIds)', { placeIds })
      .groupBy('place.id')
      .getRawMany();
}

interface VisitOptions {
  limit?: number;
  skip?: number;
}

interface AverageScore {
  round: number | null;
}

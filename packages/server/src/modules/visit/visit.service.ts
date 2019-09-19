import { Repository } from 'typeorm';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Visit } from './visit.entity';
import { Place } from '../place/place.entity';
import { User } from '../user/user.entity';
import { Order } from './order/order.entity';
import { Rate } from './rate/rate.entity';
import { AddVisitInput } from './visit.types';
import { RateInput } from './rate/rate.types';
import { round } from '../../utils';
import { WantToVisitService } from '../place/wantToVisit/wantToVisit.service';

@Service()
export class VisitService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Rate)
    private readonly rateRepository: Repository<Rate>,
    private readonly wtvService: WantToVisitService
  ) {}

  async findById(id: string) {
    return this.visitRepository.findOne(id);
  }

  async createVisit(input: AddVisitInput, place: Place, user: User) {
    const orders = input.orders
      ? await Promise.all(
          input.orders.map(async title =>
            this.orderRepository.create({ title, user })
          )
        )
      : [];

    const ratings = await Promise.all(
      input.ratings.map(async rating => {
        const parent = await this.rateRepository.create({ ...rating });

        await this.rateRepository.save(parent);

        if (rating.children) {
          await Promise.all(
            rating.children.map(async child => {
              const createdChild = this.rateRepository.create({
                ...child,
                parentId: parent.id
              });

              await this.rateRepository.save(createdChild);
            })
          );
        }

        return parent;
      })
    );

    const score = round(
      input.ratings.reduce(
        (total: number, rate: RateInput) => (total += rate.score),
        0
      ) / input.ratings.length
    );

    const visit = this.visitRepository.create({
      ...input,
      orders,
      place,
      placeId: place.id,
      user,
      score,
      userId: user.id,
      ratings
    });

    await this.wtvService.setVisited(place.providerId, user);

    return await this.visitRepository.save(visit);
  }
}

import {
  Resolver,
  Arg,
  Query,
  FieldResolver,
  Root,
  Ctx,
  Authorized,
  Mutation
} from 'type-graphql';
import { Place } from './place.entity';
import { Visit } from '../visit/visit.entity';
import { PlaceService } from './place.service';
import { Service } from 'typedi';
import {
  PlaceSearchResult,
  PriceLevel,
  PlaceDetails,
  PlaceDetailsBasic,
  PositionInput
} from './place.types';
import { Context } from '../../graphql/types';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { WantToVisitService } from './wantToVisit/wantToVisit.service';
import { Tag } from './tag/tag.entity';
import { transformToBasicDetails } from './place.helpers';

@Service()
@Resolver(Place)
export class PlaceResolver {
  constructor(
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly wtvService: WantToVisitService
  ) {}

  @Authorized()
  @Query(() => PlaceSearchResult)
  async searchPlace(
    @Ctx() ctx: Context,
    @Arg('query') query: string,
    @Arg('position', { nullable: true }) position?: PositionInput
  ): Promise<PlaceSearchResult> {
    const places = await this.placeService.searchPlaces(
      ctx.req.session.userId,
      query,
      position
    );

    return new PlaceSearchResult({ places });
  }

  @Authorized()
  @Query(() => PlaceDetails)
  async placeDetails(
    @Arg('providerId') providerId: string
  ): Promise<PlaceDetails> {
    return this.placeService.getPlaceDetails(providerId);
  }

  @Authorized()
  @Query(() => Place, { nullable: true })
  async place(@Arg('providerId') providerId: string): Promise<Place | null> {
    const placeDetails = await this.placeService.getPlaceDetails(providerId);

    if (!placeDetails) {
      return null;
    }

    const userPlace = await this.placeService.findByProviderId(providerId);

    if (!userPlace) {
      const place = new Place();
      place.providerPlaceId = placeDetails.providerId;
      place.priceLevel = PriceLevel.NotSet;
      place.tags = [];
      return place;
    }

    return userPlace;
  }

  @Authorized()
  @Query(() => [PlaceDetailsBasic])
  async wantToVisitList(@Ctx() ctx: Context): Promise<PlaceDetailsBasic[]> {
    const placeDetailsList = await this.placeService.getWantToVisitList(
      ctx.req.session.userId
    );

    const transform = transformToBasicDetails([]);

    return placeDetailsList.map(transform);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async toggleWantToVisit(
    @Arg('providerPlaceId') providerPlaceId: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    return this.wtvService.toggle(providerPlaceId, ctx.req.session.userId);
  }

  @Authorized()
  @Mutation(() => PriceLevel)
  async setPriceLevel(
    @Arg('providerPlaceId') providerPlaceId: string,
    @Arg('priceLevel') priceLevel: PriceLevel,
    @Ctx() ctx: Context
  ): Promise<PriceLevel> {
    return this.placeService.setPriceLevel(
      providerPlaceId,
      priceLevel,
      ctx.req.session.userId
    );
  }

  @Authorized()
  @Mutation(() => Tag)
  async addTag(
    @Arg('providerPlaceId') providerPlaceId: string,
    @Arg('name') name: string,
    @Ctx() ctx: Context
  ): Promise<Tag> {
    return this.placeService.addTag(
      providerPlaceId,
      name,
      ctx.req.session.userId
    );
  }

  @Authorized()
  @Mutation(() => Number)
  async removeTag(
    @Arg('providerPlaceId') providerPlaceId: string,
    @Arg('tagId') tagId: number,
    @Ctx() ctx: Context
  ): Promise<number> {
    return this.placeService.removeTag(
      providerPlaceId,
      tagId,
      ctx.req.session.userId
    );
  }

  @Authorized()
  @Mutation(() => String)
  async setComment(
    @Arg('providerPlaceId') providerPlaceId: string,
    @Arg('comment') comment: string,
    @Ctx() ctx: Context
  ): Promise<string> {
    return this.placeService.setComment(
      providerPlaceId,
      comment,
      ctx.req.session.userId
    );
  }

  @FieldResolver()
  async visits(
    @Root() place: Place,
    @Arg('limit', { nullable: true }) limit?: number
  ): Promise<Visit[]> {
    return this.placeService.getVisits(place.id, { limit });
  }

  @FieldResolver()
  async user(@Root() place: Place): Promise<User | null> {
    if (!place.userId) {
      return null;
    }

    const user = await this.userService.findById(place.userId);

    if (!user) {
      throw new Error('No user found');
    }

    return user;
  }

  @FieldResolver(() => Number)
  async visitCount(@Root() place: Place): Promise<number> {
    return this.placeService.getVisitCount(place.id);
  }

  @FieldResolver(() => Number)
  async averageScore(@Root() place: Place): Promise<number> {
    return this.placeService.getAverageScore(place.id);
  }

  @FieldResolver(() => PlaceDetails)
  async details(@Root() place: Place): Promise<PlaceDetails> {
    return this.placeService.getPlaceDetails(place.providerPlaceId);
  }

  @FieldResolver(() => Boolean)
  async hasVisited(@Root() place: Place): Promise<boolean> {
    return (await this.visitCount(place)) > 0;
  }

  @FieldResolver(() => Boolean)
  async wantToVisit(
    @Root() place: Place,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const wantToVisit = await this.wtvService.findByProviderId(
      place.providerPlaceId,
      ctx.req.session.userId
    );

    return Boolean(wantToVisit);
  }
}

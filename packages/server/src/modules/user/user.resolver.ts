import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware
} from 'type-graphql';
import { Service } from 'typedi';
import { Context } from '../../graphql/types';
import { RateLimit } from '../middleware/rateLimit';
import { User } from './user.entity';
import { UserNotConfirmedError, UserService } from './user.service';
import {
  LoginMutationResponse,
  LoginResponseCode,
  UserRegisterInput
} from './user.types';

@Service()
@Resolver(User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}
  @Query(() => User, { nullable: true })
  async me(@Ctx() ctx: Context): Promise<User | null> {
    return this.userService.getMe(ctx.req.session.userId!);
  }

  @UseMiddleware(RateLimit(20))
  @Mutation(() => Boolean)
  async confirmUser(
    @Arg('token') token: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    return this.userService.confirmUser(token, ctx.req);
  }

  @UseMiddleware(RateLimit(20))
  @Mutation(() => LoginMutationResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: Context
  ): Promise<LoginMutationResponse> {
    const response = new LoginMutationResponse();
    response.messages = [];
    try {
      const user = await this.userService.login(email, password, ctx.req);

      response.code = LoginResponseCode.Success;
      response.user = user;
      response.success = true;
    } catch (e) {
      response.code = LoginResponseCode.NotFound;
      response.user = null;
      response.success = false;
      response.messages = ['Kunde inte hitta någon användare'];

      if (e instanceof UserNotConfirmedError) {
        response.code = LoginResponseCode.NotConfirmed;
        response.messages = ['Ditt konto behöver bekräftas'];
      }
    } finally {
      return response;
    }
  }

  @UseMiddleware(RateLimit(20))
  @Authorized()
  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: Context): Promise<boolean> {
    return this.userService.logout(ctx.req);
  }

  @UseMiddleware(RateLimit(20))
  @Mutation(() => Boolean)
  async sendConfirmationEmail(@Arg('email') email: string): Promise<boolean> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new Error('No user found');
    }

    return this.userService.sendConfirmationEmail(user);
  }

  @UseMiddleware(RateLimit(10))
  @Mutation(() => User, { nullable: true })
  async register(
    @Arg('data') data: UserRegisterInput,
    @Ctx() ctx: Context
  ): Promise<User | null> {
    return this.userService.register(data, ctx.req);
  }

  @FieldResolver(() => Number)
  async placeCount(@Root() user: User): Promise<number> {
    return this.userService.getUserPlaceCount(user.id);
  }

  @FieldResolver(() => Number)
  async visitCount(@Root() user: User): Promise<number> {
    return this.userService.getUserVisitCount(user.id);
  }
}

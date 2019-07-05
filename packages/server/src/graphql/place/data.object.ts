import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class VenueDetails {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Contact, { nullable: true })
  contact: Contact;

  @Field(() => Location, { nullable: true })
  location: Location;

  @Field({ nullable: true })
  url: string;

  @Field({ nullable: true })
  description: string;
}

@ObjectType()
class Location {
  @Field({ nullable: true })
  address: string;
  @Field({ nullable: true })
  crossStreet: string;
  @Field({ nullable: true })
  lat: number;
  @Field({ nullable: true })
  lng: number;
  @Field({ nullable: true })
  distance: number;
  @Field({ nullable: true })
  postalCode: string;
  @Field({ nullable: true })
  cc: string;
  @Field({ nullable: true })
  city: string;
  @Field({ nullable: true })
  state: string;
  @Field({ nullable: true })
  country: string;
  @Field(() => [String])
  formattedAddress: string[];
}

@ObjectType()
class Contact {
  @Field({ nullable: true })
  phone: string;
  @Field({ nullable: true })
  formattedPhone: string;
  @Field({ nullable: true })
  twitter: string;
  @Field({ nullable: true })
  instagram: string;
  @Field({ nullable: true })
  facebook: string;
  @Field({ nullable: true })
  facebookUsername: string;
  @Field({ nullable: true })
  facebookName: string;
}

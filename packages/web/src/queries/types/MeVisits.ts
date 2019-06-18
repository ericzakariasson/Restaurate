/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: MeVisits
// ====================================================

export interface MeVisits_me_visits_orders {
  __typename: "Order";
  id: string;
  title: string;
}

export interface MeVisits_me_visits_rating {
  __typename: "Rating";
  score: number;
  food: number | null;
  service: number | null;
  environment: number | null;
  experience: number | null;
}

export interface MeVisits_me_visits_place_address {
  __typename: "Address";
  formatted: string;
}

export interface MeVisits_me_visits_place {
  __typename: "Place";
  id: string;
  name: string;
  address: MeVisits_me_visits_place_address;
  slug: string;
}

export interface MeVisits_me_visits {
  __typename: "Visit";
  id: string;
  comment: string | null;
  visitDate: any;
  orders: MeVisits_me_visits_orders[] | null;
  rating: MeVisits_me_visits_rating;
  place: MeVisits_me_visits_place;
}

export interface MeVisits_me {
  __typename: "User";
  visitCount: number;
  visits: MeVisits_me_visits[];
}

export interface MeVisits {
  me: MeVisits_me | null;
}
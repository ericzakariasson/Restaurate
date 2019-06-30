import { PlaceDetailsResult } from '@google/maps';
import { Address } from './Address';

export function createFromPlaceData(placeData: PlaceDetailsResult): Address {
  const address = new Address();
  const postal_town = placeData.address_components.find(c =>
    c.types.includes('postal_town')
  );
  address.city = postal_town ? postal_town.long_name : '';

  const route = placeData.address_components.find(c =>
    c.types.includes('route')
  );
  address.street = route ? route.long_name : '';

  const street_number = placeData.address_components.find(c =>
    c.types.includes('street_number')
  );
  address.streetNumber = street_number ? street_number.long_name : '';

  const country = placeData.address_components.find(c =>
    c.types.includes('country')
  );
  address.country = country ? country.long_name : '';

  const postal_code = placeData.address_components.find(c =>
    c.types.includes('postal_code')
  );
  address.postalCode = postal_code ? postal_code.long_name : '';

  const sublocality = placeData.address_components.find(c =>
    c.types.includes('sublocality')
  );
  address.sublocality = sublocality ? sublocality.long_name : '';

  return address;
}

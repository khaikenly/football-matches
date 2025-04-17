import { omit } from 'lodash';

type OmitFields = 'password' | 'deletedAt';
type ResourceObject = Record<string, unknown>;
type Resource = string | ResourceObject | ResourceObject[];

export const formatResource = (response: Resource) => {
  const OMIT_FIELDS: OmitFields[] = ['password', 'deletedAt'];

  const sanitize = (item: ResourceObject): ResourceObject =>
    omit(item, OMIT_FIELDS);

  const data =
    typeof response === 'string'
      ? response
      : Array.isArray(response)
        ? response.map(sanitize)
        : sanitize(response);

  return {
    status: 'success',
    data,
  };
};

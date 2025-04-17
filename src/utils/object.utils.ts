import { classToPlain } from 'class-transformer';

/**
 * Converts Entity props to a plain object.
 * Useful for testing and debugging.
 * @param props
 */
export function convertPropsToObject(props) {
  const propsCopy = structuredClone(props);
  for (const prop in propsCopy) {
    if (Array.isArray(propsCopy[prop])) {
      propsCopy[prop] = (propsCopy[prop] as Array<unknown>).map((item) => {
        return classToPlain(item);
      });
    }
    propsCopy[prop] = classToPlain(propsCopy[prop]);
  }

  return propsCopy;
}

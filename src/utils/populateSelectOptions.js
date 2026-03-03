import { capitalizeWords } from ".";

/**
 *
 * @param {Array<{ name: string, id: string }>} data
 * @param {((item: { name: string, id: string }) => boolean} filterCallback
 *
 * @returns { Array<{ label: string, value: string}> }
 */
export const populateSelectOptions = (data, filterCallback = () => true) => {
  return data?.filter(filterCallback)?.map((item) => ({
    label: capitalizeWords(item.name),
    value: item.id,
  }));
};

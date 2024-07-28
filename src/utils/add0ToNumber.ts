export const add0ToNumber = (num: number) => {
  return num < 10 ? `0${num}` : num;
};
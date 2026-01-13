export default function parseMs(miliseconds) {
  const hours = Math.floor(miliseconds / 3600000);
  miliseconds -= hours * 3600000;

  const minutes = Math.floor(miliseconds / 60000);
  miliseconds -= minutes * 60000;

  const seconds = Math.floor(miliseconds / 1000);

  return {
    hours,
    minutes,
    seconds,
  };
}

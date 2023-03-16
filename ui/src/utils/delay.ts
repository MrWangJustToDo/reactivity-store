export const delay = (time: number) =>
  new Promise((r) => {
    setTimeout(r, time);
  });

export const handleSuccessResponse = (data) => (_req, res, ctx) => {
  return res(ctx.status(200), data && ctx.json(data));
};

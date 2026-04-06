export const shopController = {
  /** `POST /api/shops/:shopId/service-area/check` */
  checkServiceArea: (ctx) => async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { lat, lng } = req.body;
      const result = await ctx.checkShopServiceArea({ shopId, lat, lng });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

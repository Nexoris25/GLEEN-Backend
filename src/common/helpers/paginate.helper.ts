import { FindAndCountOptions, ModelStatic } from 'sequelize';

const MAX_LIMIT = 500;

export async function paginate<T>(
  model: ModelStatic<any>,
  options: FindAndCountOptions,
  limit?: number,
  offset?: number,
) {
  const usePagination = limit !== undefined || offset !== undefined;

  // 🔹 If pagination NOT provided → cap at 500
  if (!usePagination) {
    const rows = await model.findAll({
      ...options,
      limit: MAX_LIMIT,
    });

    return {
      data: rows,
      meta: {
        totalItems: rows.length,
        limit: MAX_LIMIT,
        offset: 0,
        capped: true,
      },
    };
  }

  // 🔹 Pagination provided
  const safeLimit = Math.min(limit ?? 10, MAX_LIMIT);
  const safeOffset = offset ?? 0;

  const { rows, count } = await model.findAndCountAll({
    ...options,
    limit: safeLimit,
    offset: safeOffset,
  });

  return {
    data: rows,
    meta: {
      totalItems: count,
      limit: safeLimit,
      offset: safeOffset,
      currentCount: rows.length,
      hasNext: safeOffset + safeLimit < count,
      hasPrevious: safeOffset > 0,
    },
  };
}

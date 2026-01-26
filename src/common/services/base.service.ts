import { ModelStatic } from 'sequelize';
import { paginate } from '../helpers/paginate.helper';
import { PaginationDto } from '../dto/pagination.dto';

export abstract class BaseService<T> {
  protected constructor(protected readonly model: ModelStatic<any>) {}

  async findAll(
    pagination: PaginationDto,
    options = {},
  ) {
    const { limit, offset } = pagination;
    return paginate(this.model, options, limit, offset);
  }
}

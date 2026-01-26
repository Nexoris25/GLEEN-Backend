import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lga } from 'src/states/models/lga.model'; // adjust path

@ValidatorConstraint({ async: true })
@Injectable()
export class LgaExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(Lga)
    private readonly lgaModel: typeof Lga,
  ) {}

  async validate(lgaId: string): Promise<boolean> {
    if (!lgaId) return true; // field is optional
    const lga = await this.lgaModel.findByPk(lgaId);
    return !!lga;
  }

  defaultMessage(): string {
    return 'LGA with the given ID does not exist';
  }
}

export function IsLgaExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: LgaExistsConstraint,
    });
  };
}

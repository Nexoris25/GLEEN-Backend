import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { State } from 'src/states/models/state.model'; // adjust path

@ValidatorConstraint({ async: true })
@Injectable()
export class StateExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(State)
    private readonly stateModel: typeof State,
  ) {}

  async validate(stateId: string): Promise<boolean> {
    if (!stateId) return true; // optional
    const state = await this.stateModel.findByPk(stateId);
    return !!state; // true if found, false otherwise
  }

  defaultMessage(): string {
    return 'State with the given ID does not exist';
  }
}

export function IsStateExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: StateExistsConstraint,
    });
  };
}

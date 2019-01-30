import AppError from 'onewallet.library.error';

export class AggregateVersionExistsError extends AppError {
  constructor(event: any) {
    super('AGGREGATE_VERSION_EXISTS', 'Aggregate version already exists', {
      event,
    });
  }
}

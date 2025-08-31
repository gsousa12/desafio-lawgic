export interface IFormsRepository {
  getFormByStep(stepKey: string): Promise<any>;
}

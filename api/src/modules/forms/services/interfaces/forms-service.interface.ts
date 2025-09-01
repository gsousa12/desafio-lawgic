export interface IFormsService {
  getFormByStep(stepKey: string): Promise<any>;
}

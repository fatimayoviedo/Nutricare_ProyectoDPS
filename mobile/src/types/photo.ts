export interface SavedPhoto {
  id: string;
  uri: string;
  mealType: string;
  comment: string;
  createdAt: string;
  patientId?: string;
  patientName?: string;
  nutritionistComment?: string;
}

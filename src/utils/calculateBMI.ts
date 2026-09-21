export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightMeters = heightCm / 100;
  return Number((weightKg / heightMeters ** 2).toFixed(1));
}


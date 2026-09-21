export function calculateAge(dateOfBirth: string, referenceDate = new Date()) {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  if (!year || !month || !day) return 0;

  let age = referenceDate.getFullYear() - year;
  const birthdayHasPassed =
    referenceDate.getMonth() + 1 > month ||
    (referenceDate.getMonth() + 1 === month && referenceDate.getDate() >= day);

  if (!birthdayHasPassed) age -= 1;
  return age;
}

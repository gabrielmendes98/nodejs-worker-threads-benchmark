export function generateFakeNumber(size = 8) {
  let result = "";
  const numbers = "0123456789";
  for (let i = 0; i < size; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return result;
}

export function generateFakeSalary() {
  const salaryInt = Number(generateFakeNumber(7));
  return salaryInt / 100;
}

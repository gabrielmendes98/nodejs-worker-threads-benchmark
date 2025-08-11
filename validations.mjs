export function validateDocument(document) {
  return document?.length === 8;
}

export function validateAgency(agency) {
  return agency?.length === 4;
}

export function validateAccount(account) {
  return account?.length === 6;
}

export function validateValue(value) {
  if (!value) {
    return false;
  }
  return !isNaN(Number(value));
}

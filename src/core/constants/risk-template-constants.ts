export enum RiskField {
  DESC = 'DESC',
  ISO = 'ISO',
  SOURCE = 'SOURCE',
  DEP = 'DEP',
  LOC = 'LOC',
  TYPEHAZ = 'TYPEHAZ',
  HAZ = 'HAZ',
  DESCHAZ = 'DESCHAZ',
  DESCPOTHAZ = 'DESCPOTHAZ',
  JOBFUNC = 'JOBFUNC',
  PERSONS = 'PERSONS',
  IL = 'IL',
  IC = 'IC',
  MITIGATION = 'MITIGATION',
  RL = 'RL',
  RC = 'RC',
  USER = 'USER',
  DUE_DATE = 'DUE_DATE',
  STATUS = 'STATUS',
  REMARKS = 'REMARKS'
}

export type RiskFieldStrings = keyof typeof RiskField;

export const COL_TO_FIELD = {
  'A': RiskField.DESC,
  'B': RiskField.ISO,
  'C': RiskField.SOURCE,
  'D': RiskField.DEP,
  'E': RiskField.LOC,
  'F': RiskField.TYPEHAZ,
  'G': RiskField.HAZ,
  'H': RiskField.DESCHAZ,
  'I': RiskField.DESCPOTHAZ,
  'J': RiskField.JOBFUNC,
  'K': RiskField.PERSONS,
  'L': RiskField.IL,
  'M': RiskField.IC,
  'N': RiskField.MITIGATION,
  'O': RiskField.RL,
  'P': RiskField.RC,
  'Q': RiskField.USER,
  'R': RiskField.DUE_DATE,
  'S': RiskField.STATUS,
  'T': RiskField.REMARKS
}

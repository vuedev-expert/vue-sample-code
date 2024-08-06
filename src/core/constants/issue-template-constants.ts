export enum IssueField {
    DESC = 'DESC',
    ISO = 'ISO',
    DEP = 'DEP',
    LOC = 'LOC',
    PERSONS = 'PERSONS',
    MITIGATION = 'MITIGATION',
    RISK = 'RISK',
    LEGAL_REGISTER = 'LEGAL_REGISTER',
    LEGISLATION = 'LEGISLATION',
    OCCURENCE_DATE = 'OCCURENCE_DATE',
    DUE_DATE = 'DUE_DATE',
    USER = 'USER',
    PRIORITY_TYPE = 'PRIORITY_TYPE',
    ISSUE_TYPE = 'ISSUE_TYPE',
    OTHERS = 'OTHERS',
    WHYS = 'WHYS',
    REMARKS = 'REMARKS',
    STATUS = 'STATUS'
}

export type IssueFieldStrings = keyof typeof IssueField;

export const COL_TO_FIELD = {
    'A': IssueField.DESC,
    'B': IssueField.ISO,
    'C': IssueField.DEP,
    'D': IssueField.LOC,
    'E': IssueField.PERSONS,
    'F': IssueField.MITIGATION,
    'G': IssueField.RISK,
    'H': IssueField.LEGAL_REGISTER,
    'I': IssueField.LEGISLATION,
    'J': IssueField.OCCURENCE_DATE,
    'K': IssueField.DUE_DATE,
    'L': IssueField.USER,
    'M': IssueField.PRIORITY_TYPE,
    'N': IssueField.ISSUE_TYPE,
    'O': IssueField.OTHERS,
    'P': IssueField.WHYS,
    'Q': IssueField.REMARKS,
    'R': IssueField.STATUS
}

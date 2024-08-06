import { RoleEnum } from './../models/role.model'
import { QueryParams } from '@/core/models/query-param.model'
import { OrgUser } from '@/core/models/user.model'
import { Ref } from 'vue'
import { helpers } from '@vuelidate/validators'
import { AppPermission } from '../models/permission.model'
import { useAuthStore } from '@/store/use-auth-store'

type EnumObject = { [key: string]: number | string }
type EnumObjectEnum<E extends EnumObject> = E extends {
  [key: string]: infer ET | string
}
  ? ET
  : never

export function getEnumValues<E extends EnumObject>(enumObject: E): EnumObjectEnum<E>[] {
  return Object.keys(enumObject)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => enumObject[key] as EnumObjectEnum<E>)
}

const zeroPad = (number: number): string => {
  return ('0' + number).slice(-2)
}

export function formatTime(d: String | Date): string {
  if (d) {
    const date = typeof d === 'string' ? new Date(d) : (d as Date)
    return [zeroPad(date.getHours()), zeroPad(date.getMinutes())].join(':')
  }

  return ''
}

export function formatDate(d: string | Date | Date[], separator = '/'): string {
  if (d) {
    if (typeof d === 'string') {
      const date = new Date(d)
      return formatDateString(date, separator)
    }
    if (Array.isArray(d)) return formatDateString(d[0], separator) + ' - ' + formatDateString(d[1], separator)
    return formatDateString(d, separator)
  }

  return 'N/A'
}

export function formatDateToDateString(d: Date): string {
  if (d) {
    const date = new Date(d);
    const day = String(date.getDate());
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const year = date.getFullYear();
    const dayWithSuffix = getDaySuffix(day)
    return `${dayWithSuffix} ${month} ${year}`;
  }
  return ''
}

function getDaySuffix (day :string) {
  if (day.endsWith('1') && day !== '11') return `${day}<sup>st</sup>`
  else if (day.endsWith('2') && day !== '12') return `${day}<sup>nd</sup>`
  else if (day.endsWith('3') && day !== '13') return `${day}<sup>rd</sup>`
  return `${day}<sup>th</sup>`
}

export const convertDateToOrdinal = (date :number) => {
  const dateString = formatDate(new Date(date*1000))
  const dateParts = dateString.split('/');
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1
  const year = parseInt(dateParts[2])
  const endDate = new Date(year, month, day)
  return getDaySuffix(String(day)) + " of " + endDate.toLocaleString('en-US', { month: 'long' }) + " " + year
}

export function formatDateString(date: Date, separator = '/'): string {
  return [zeroPad(date.getDate()), zeroPad(date.getMonth() + 1), date.getFullYear()].join(separator)
}

export function formatDateTime(d: String | Date, separator = '/'): string {
  if (d) {
    const date = typeof d === 'string' ? new Date(d) : (d as Date)
    return [formatDate(date, separator), formatTime(date)].join(' ')
  }

  return ''
}

export function getUserName(user?: OrgUser): string {
  if (user) {
    return [user.firstName, user.lastName].join(' ')
  }

  return ''
}

export function external(param: Ref<boolean>) {
  return helpers.withParams({ type: 'external', value: param }, (value) => !helpers.req(value) || param.value)
}

export function toQueryParamsString(queryParams: QueryParams): string {
  const result: string[] = []
  for (const key in queryParams) {
    const param = queryParams[key]
    if (param) {
      if (Array.isArray(param)) {
        if (param.length) result.push(`${key}=${encodeURIComponent(param.toString())}`)
      } else result.push(`${key}=${encodeURIComponent(param.toString())}`)
    }
  }
  return result.join('&')
}

export function hasPermission(permissions: AppPermission[] = []): boolean {
  if (!permissions.length) return true
  const authStore = useAuthStore()
  return permissions.every((p) => authStore.userPermissions.includes(p))
}
export function hasRole(roles: RoleEnum[] = []): boolean {
  if (!roles.length) return true
  const authStore = useAuthStore()
  return roles.includes(authStore.userRole?.name as RoleEnum)
}

export function debounce<T extends Function>(cb: T, wait = 20) {
  let h: NodeJS.Timeout
  const callable = (...args: any) => {
    clearTimeout(h)
    h = setTimeout(() => cb(...args), wait)
  }
  return <T>(<any>callable)
}

export const isLitePlanCard = (name :string) :boolean => name === 'Lite'

export const openUserMail = () => {
  const mailBody = `Dear Project Team,

I came across your website and am writing to express my interest and enquire about the Enterprise plan. I'm reaching out to you on behalf of [Company Name];

Please find the following details:

Name:
Position:
Contact Number:
Company:
Total No of Users:


Regards,
[Your name]
`
  const subject = encodeURIComponent('Inquiry - Request for information on Enterprise Plan')
  const body = encodeURIComponent(mailBody)
  const recipient = 'Support@Project.com'

  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
}

export const isDeepEqual = (object1 :any, object2 :any, exceptionArrKeys? :string[]) => {
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);

  if (objKeys1.length !== objKeys2.length) return false;

  for (const key of objKeys1) {
    const value1 = object1[key];
    const value2 = object2[key];

    if (exceptionArrKeys?.includes(key)) {
      const isArrays = Array.isArray(value1) && Array.isArray(value2);

      if ((isArrays && !arraysHaveSameElements(value1, value2))
      ) return false;
    } else {
      const isObjects = isObject(value1) && isObject(value2);

      if ((isObjects && !isDeepEqual(value1, value2)) ||
          (!isObjects && value1 !== value2)
      ) return false;
    }
  }
  return true;
};

const isObject = (object :any) => object != null && typeof object === "object";

function arraysHaveSameElements(arr1 :string[], arr2 :string[]) {
  if (arr1.length !== arr2.length) return false;

  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((element, index) => element === sortedArr2[index]);
}


export function removeDuplicateNamesWithOppositeIsLatest(arr :any[]) {
  const filteredArray :any[] = [];
  arr.forEach((currentObject) => {
    const matchingIndex = filteredArray.findIndex(
        (resultObject) => resultObject.name === currentObject.name
    );

    if (matchingIndex !== -1) {
      if (currentObject.isLatest) {
        filteredArray[matchingIndex] = currentObject;
      }
    } else {
      filteredArray.push(currentObject);
    }
  });
  return filteredArray;
}

export function isMonthOlder(date :string) {
  const currentDate = new Date();
  const givenDate = new Date(date)
  const oneMonthAgo = new Date(currentDate);
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  return givenDate > oneMonthAgo  // Update won't be shown if its month older
}

export function getLatestModifiedDate(histories :any[]) {
  if (histories.length) {
    let latestDate :Date | null = null;
    histories.forEach(item => {
      const currentDate = item.modifiedAt;
      if (!latestDate || currentDate > latestDate) latestDate = currentDate;
    });

    if(latestDate) return formatDate(latestDate);
  }
  else return 'N/A'
}

export function convertToCSV(objArray: any, noException :boolean = false) {
  const array = objArray
  let str = ''

  for (let i = 0; i < array.length; i++) {
    let line = ''
    if (Array.isArray(array[i])) line = array[i].join(',')
    else {
      for (const index in array[i]) {
        if (line != '') line += ','
        if (typeof array[i][index] === "string" && array[i][index].indexOf(',')) {
          if (array[i][index].indexOf("\r\n") < 0 && (array[i][index].indexOf("\n") < 0 || noException)) line += `"${array[i][index]}"`
          else line += `"${array[i][index].replace(/(\r?\n|\r\n)/g, " ")}"`
        }
        else {
          line += array[i][index]
              .toString()
              .replace(/(\r\n|\r|\n)/g, ' ')
              .replace(/,/g, '')
        }
      }
    }
    str += line + '\r\n'
  }

  return str
}

export function exportCSVFile(headers: Object, items: any, noException :boolean = false) {
  if (headers) {
    items.unshift(headers)
  }

  // Convert Object to JSON
  console.log('item ', items)
  const csv = convertToCSV(items, noException)
  const exportedFilenmae = 'Report.csv' || 'export.csv'

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', exportedFilenmae)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

import { apiUrl } from './../configs/api-config'
import axios from 'axios'
import { AddActionPayload, UpdateActionPayload, UpdateActionStatus } from '../models/action.model'
import { QueryParams } from '../models/query-param.model'
import { toQueryParamsString } from '../helpers/common'

type UploadPayload = { name: string; uploadUrl: string }
type NameToFiles = { [k: string]: { file: File; name: string; fileType: string } }

export function getActions(params: QueryParams = {}) {
  const query = toQueryParamsString(params)

  return axios.get(`${apiUrl}/actions?${query}`)
}

export function addAction(payload: AddActionPayload) {
  return axios.post(`${apiUrl}/actions`, payload)
}

export function updateAction(id: string, payload: UpdateActionPayload) {
  return axios.put(`${apiUrl}/actions/${id}`, payload)
}

export function updateActionStatus(id: string, payload: UpdateActionStatus) {
  return axios.put(`${apiUrl}/actions/${id}/status`, payload)
}

export function deleteAction(id: string) {
  return axios.delete(`${apiUrl}/actions/${id}`)
}

async function getUploadUrls(files: any): Promise<UploadPayload[]> {
  return axios.post(`${apiUrl}/attachment/pre-upload`, files)
}

async function uploadFiles(nameToFiles: NameToFiles, uploadPayloads: UploadPayload[]) {
  return Promise.all(
    uploadPayloads.map((payload) => {
      const fileWrapper = nameToFiles[payload.name]
      if (!fileWrapper) throw Error('Request invalid')

      return axios({
        url: payload.uploadUrl,
        method: 'put',
        data: fileWrapper.file,
        headers: { 'Content-Type': fileWrapper.file.type }
      })
    })
  )
}

export async function uploadAttachment(files: FileList) {
  const nameToFiles: NameToFiles = {}
  Array.from(files).forEach((file) => {
    nameToFiles[file.name] = {
      file,
      name: file.name,
      fileType: file.type
    }
  })

  const uploadPayloads = await getUploadUrls(
    Object.values(nameToFiles).map((it) => ({
      name: it.name,
      fileType: it.fileType
    }))
  )
  await uploadFiles(nameToFiles, uploadPayloads)

  return axios.post(`${apiUrl}/attachment/upload`, uploadPayloads)
}

export function downloadAttachment(id: string, name: string) {
  return axios.get(`${apiUrl}/attachment/${id}/download`).then((res: any) => {
    if (res.url) {
      const a = document.createElement('a')
      a.href = res.url
      a.setAttribute('download', name)
      a.setAttribute('target', '_blank')
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  })
}

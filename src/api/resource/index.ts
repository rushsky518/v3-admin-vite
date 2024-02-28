import { request } from "@/utils/service"
import type * as Resource from "./types/resource"

/** 增 */
export function createResourceDataApi(data: Resource.CreateResourceRequestData) {
  return request({
    url: "resource",
    method: "post",
    data
  })
}

/** 删 */
export function deleteResourceDataApi(id: string) {
  return request({
    url: `resource/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateResourceDataApi(data: Resource.UpdateResourceRequestData) {
  return request({
    url: "resource",
    method: "put",
    data
  })
}

/** 查 */
export function getResourceDataApi(params: Resource.GetResourceRequestData) {
  return request<Resource.GetResourceResponseData>({
    url: "resource",
    method: "get",
    params
  })
}

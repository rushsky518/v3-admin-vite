import { request } from "@/utils/service"
import type * as Building from "./types/building"

/** 增 */
export function createBuildingDataApi(data: Building.CreateBuildingRequestData) {
  return request({
    url: "building",
    method: "post",
    data
  })
}

/** 删 */
export function deleteBuildingDataApi(id: string) {
  return request({
    url: `building/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateBuildingDataApi(data: Building.UpdateBuildingRequestData) {
  return request({
    url: "building",
    method: "put",
    data
  })
}

/** 查 */
export function getBuildingDataApi(params: Building.GetBuildingRequestData) {
  return request<Building.GetBuildingResponseData>({
    url: "building",
    method: "get",
    params
  })
}

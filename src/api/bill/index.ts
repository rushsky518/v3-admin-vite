import { request } from "@/utils/service"
import type * as Bill from "./types/bill"

/** 增 */
export function createBillDataApi(data: Bill.CreateBillRequestData) {
  return request({
    url: "bill",
    method: "post",
    data
  })
}

/** 改 */
export function updateBillDataApi(data: Bill.UpdateBillRequestData) {
  return request({
    url: "bill",
    method: "put",
    data
  })
}

/** 查 */
export function getBillDataApi(params: Bill.GetBillRequestData) {
  return request<Bill.GetBuildingResponseData>({
    url: "bill",
    method: "get",
    params
  })
}

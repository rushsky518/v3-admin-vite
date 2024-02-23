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
  return request<Bill.GetBillResponseData>({
    url: "bill",
    method: "get",
    params
  })
}

/** 查 */
export function getPledgeDataApi(params: Bill.GetPledgeRequestData) {
  return request<Bill.GetBillResponseData>({
    url: "queryActualPledge",
    method: "get",
    params
  })
}
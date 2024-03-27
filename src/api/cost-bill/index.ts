import { request } from "@/utils/service"
import type * as CostBill from "./types/cost-bill"

/** 增 */
export function createCostBillDataApi(data: CostBill.CreateCostBillRequestData) {
  return request({
    url: "costBill",
    method: "post",
    data
  })
}


/** 查 */
export function getCostBillDataApi(params: CostBill.GetCostBillRequestData) {
  return request<CostBill.GetCostBillResponseData>({
    url: "costBill",
    method: "get",
    params
  })
}

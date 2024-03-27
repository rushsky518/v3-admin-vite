import internal from "stream"

export interface CreateCostBillRequestData {
  buildingId: Number
  rent: Number
  pledge: number
  water: number
  electric: Number
  network: string
  gas: string
  billMonth: string
}

export interface GetCostBillRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：房间 id */
  buildingId?: string
}

export interface GetCostBillData {
  id: string
  buildingId: Number
  rent: Number
  pledge: number
  water: number
  electric: Number
  network: string
  gas: string
  billMonth: string
  total: number
}

export type GetCostBillResponseData = ApiResponseData<{
  list: GetCostBillData[]
  total: number
}>


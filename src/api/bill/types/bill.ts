import internal from "stream"

export interface CreateBillRequestData {
  roomId: Number
  roomSize: Number
  originalRent: number
  actualRent: number
  pledge: Number
  tenantName: string
  tenantPhone: string
  billMonth: string
  status: Number
  op: number
}

export interface UpdateBillRequestData {
  id: Number
  roomId: Number
  actualRent: number
  billMonth: string
}

export interface GetBillRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：房间 id */
  roomId?: string
  /** 查询参数：手机号 */
  tenantPhone?: string
}

export interface GetBillData {
  id: string
  buildingNum: number
  roomId: number
  roomNum: number
  roomSize: number
  originalRent: number
  actualRent: number
  debt: number
  originalPledge: number  
  actualPledge: number  
  tenantName: string
  tenantPhone: string
  billMonth: string
}

export type GetBuildingResponseData = ApiResponseData<{
  list: GetBillData[]
  total: number
}>


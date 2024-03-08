import internal from "stream"

export interface CreateResourceRequestData {
  roomId: Number
  valueMonth: Date
  amount: number
  reset: Number
  type: string
}

export interface UpdateResourceRequestData {
  id: Number
  roomId: Number
  valueMonth: Date
  amount: number
  reset: Number
  type: string
}

export interface GetResourceRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：房间 id */
  roomId?: string
  /** 查询参数：手机号 */
  type?: string
}


export interface Activity {
  valueMonth: Date
  amount: number
}

export interface GetResourceData {
  buildingId: Number
  roomId: Number
  roomNum: string
  activities: Activity[]
  type: string
}

export type GetResourceResponseData = ApiResponseData<{
  list: GetResourceData[]
  total: number
}>


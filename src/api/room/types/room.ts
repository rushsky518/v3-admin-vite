export interface CreateRoomRequestData {
  roomNum: string
  roomSize: string
  rent: string
}

export interface UpdateRoomRequestData {
  id: string
  username: string
  password?: string
}

export interface GetRoomRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  username?: string
  /** 查询参数：手机号 */
  phone?: string
}

export interface GetRoomData {
  id: number
  buildingId: number
  roomNum: string
  roomSize: number
  rent: number
  pledge: number
  network: number
  tenantName: string
  tenantPhone: string
  free: number
  checkInDate: Date
}

export type GetRoomResponseData = ApiResponseData<{
  list: GetRoomData[]
  total: number
}>

export interface CreateBuildingRequestData {
  username: string
  password: string
}

export interface UpdateBuildingRequestData {
  id: string
  username: string
  password?: string
}

export interface GetBuildingRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：用户名 */
  username?: string
  /** 查询参数：手机号 */
  phone?: string
}

export interface GetBuildingData {
  id: string
  buildingNum: number
  rooms: number
  rentedRooms: number
  freeRooms: number
  address: string
}

export type GetBuildingResponseData = ApiResponseData<{
  list: GetBuildingData[]
  total: number
}>

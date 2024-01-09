import { request } from "@/utils/service"
import type * as Room from "./types/room"

/** 增 */
export function createRoomDataApi(data: Room.CreateRoomRequestData) {
  return request({
    url: "room",
    method: "post",
    data
  })
}

/** 删 */
export function deleteRoomDataApi(id: string) {
  return request({
    url: `room/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateRoomDataApi(data: Room.UpdateRoomRequestData) {
  return request({
    url: "room",
    method: "put",
    data
  })
}

/** 查 */
export function getRoomDataApi(params: Room.GetRoomRequestData) {
  return request<Room.GetRoomResponseData>({
    url: "room",
    method: "get",
    params
  })
}

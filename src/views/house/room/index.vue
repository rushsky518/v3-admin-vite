<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getRoomDataApi,createRoomDataApi,updateRoomDataApi } from "@/api/room"
import { type GetRoomData } from "@/api/room/types/room"
import { createAllBillDataApi, createBillDataApi, getPledgeDataApi } from "@/api/bill"
import { type GetBillData } from "@/api/bill/types/bill"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox, type TableColumnCtx } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { freeOptions, buildingOptions } from "@/views/house/common"
import { format, endOfMonth, subMonths, startOfMonth } from "date-fns"


defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const roomDialogVisible = ref<boolean>(false)
const billDialogVisible = ref<boolean>(false)
const quitDialogVisible = ref<boolean>(false)

const formRef = ref<FormInstance | null>(null)

const formData = reactive({
  roomNum: "",
  roomSize: "",
  rent: ""
})

const resetForm = () => {
  currentUpdateId.value = undefined
  for (let key in formData) {
    formData[key] = ""  
  }
}

const billFormRef = ref<FormInstance | null>(null)

const billFormData = reactive({
  roomNum: "",
  roomSize: "",
  rent: "",
  pledge: "",
  month: ""
})

const resetBillForm = () => {
  currentUpdateId.value = undefined

  for (let key in billFormData) {
    billFormData[key] = ""  
  }
}

const formRules: FormRules = reactive({
  roomNum: [{ required: true, trigger: "blur", message: "请输入房间号" }],
  roomSize: [{ required: true, trigger: "blur", message: "请输入房间面积" }],
  rent: [{ required: true, trigger: "blur", message: "请输入租金" }]
})

const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        formData.buildingId = searchData.buildingId
        createRoomDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getRoomData()
          })
          .finally(() => {
            roomDialogVisible.value = false
          })
      } else {

        ElMessageBox.confirm(
          '确定提交吗?',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            draggable: true,
          }
        )
          .then(() => {
            let nullValue = (formData.checkInDate === undefined || formData.checkInDate === null || formData.checkInDate === '')
            if (!nullValue) {
              formData.checkInDate = format(formData.checkInDate, "yyyy-MM-dd", "Asia/Shanghai")
            }

            updateRoomDataApi({
              id: currentUpdateId.value,
              roomSize: formData.roomSize,
              rent: formData.rent,
              pledge: formData.pledge,
              tenantName: formData.tenantName,
              tenantPhone: formData.tenantPhone,
              free: formData.onRent == true ? 0 : 1,
              checkInDate: formData.checkInDate
            })
              .then(() => {
                ElMessage.success("修改成功")
                getRoomData()
              })

          })
          .catch(() => {
            ElMessage({
              type: '通知',
              message: '取消提交',
            })
          }) 
          .finally(() => {
            roomDialogVisible.value = false
          })

        // if (formData.free == '0') {
        //   ElMessage.success("房间已经出租，无法修改")
        //   return
        // }
      }
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}


const billRules: FormRules = reactive({
  rent: [{ required: true, trigger: "blur", message: "请输入租金" }],
  pledge: [{ required: true, trigger: "blur", message: "请输入押金" }],
  billMonth: [{ required: true, trigger: "blur", message: "请选择月份" }]
})

const handleCreateAllBill = () => {
  // 获取当前日期
  const currentDate = new Date();
  // 计算上月最后一天
  const lastDayOfLastMonth = endOfMonth(subMonths(currentDate, 1));
  // 使用 startOfMonth() 从上月最后一天向前推到上月第一天
  const firstDayOfLastMonth = startOfMonth(lastDayOfLastMonth);
  const now = format(firstDayOfLastMonth, "yyyy-MM", "Asia/Shanghai")

  ElMessageBox.prompt(
          '请选择账期',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            inputType: 'month',
            inputValue: now,
            draggable: true,
          }).then(() => {
            createAllBillDataApi({"checkInDate": now})
            .then(() => {
            ElMessage.success("新增成功")
          })
        })
}

// 创建账单
const handleCreateBill = () => {
  billFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      billFormData.billMonth = format(billFormData.billMonth, "yyyy-MM-dd", "Asia/Shanghai")
      createBillDataApi(billFormData)
          .then(() => {
            ElMessage.success("新增成功")
            getRoomData()
          })
          .finally(() => {
            billDialogVisible.value = false
          })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

//#endregion

//#region 删
const handleDelete = (row: GetRoomData) => {
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)

const handleUpdate = (row: GetRoomData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  formData.roomNum = row.roomNum
  formData.roomSize = row.roomSize
  formData.rent = row.rent
  formData.pledge = row.pledge
  formData.tenantName = row.tenantName
  formData.tenantPhone = row.tenantPhone
  formData.onRent = (row.free === 1 ? false : true)
  formData.checkInDate = row.checkInDate
  roomDialogVisible.value = true
}

const handleAddBill = (row: GetRoomData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  billFormData.roomId = row.id
  billFormData.roomNum = row.roomNum
  billFormData.originalPledge = row.pledge
  billFormData.originalRent = row.rent
  billFormData.tenantName = row.tenantName
  billFormData.tenantPhone = row.tenantPhone
  billFormData.billMonth = new Date()
  billFormData.free = '0'
  billDialogVisible.value = true
}


const quitFormRef = ref<FormInstance | null>(null)

const quitFormData = reactive({
  roomNum: "",
  roomSize: "",
  rent: "",
  pledge: "",
  billMonth: ""
})

const resetQuitForm = () => {
  currentUpdateId.value = undefined
  for (let key in quitFormData) {
    formData[key] = ""  
  }
}

const handleQuit = (row: GetRoomData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  quitFormData.roomId = row.id
  quitFormData.roomNum = row.roomNum
  quitFormData.actualPledge = row.pledge
  quitFormData.tenantName = row.tenantName
  quitFormData.coldWater = 0
  quitFormData.electric = 0
  quitFormData.returnPledge = 0
  quitFormData.returnRent = 0
  quitFormData.billMonth = new Date()
  quitDialogVisible.value = true
}

// 创建退租账单
const handleQuitBill = () => {
    createBillDataApi({
      "roomId": quitFormData.roomId,
      "tenantName": quitFormData.tenantName,
      "tenantPhone": quitFormData.tenantPhone,
      "coldWater": quitFormData.coldWater,
      "electric": quitFormData.electric,
      "returnRent": quitFormData.returnRent,
      "returnPledge": quitFormData.returnPledge,
      "billMonth": format(quitFormData.billMonth, "yyyy-MM-dd", "Asia/Shanghai"),
      "op": 0
    })
      .then(() => {
        ElMessage.success("新增成功")
        getRoomData()
      })
      .finally(() => {
        quitDialogVisible.value = false
      })
}

//#endregion

//#region 查
const handleSearch = () => {
  paginationData.currentPage === 1 ? getRoomData() : (paginationData.currentPage = 1)
}

const roomData = ref<GetRoomData[]>([])

const getRoomData = () => {
  loading.value = true
  getRoomDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    buildingId: searchData.buildingId || undefined,
    roomNum: searchData.roomNum || undefined,
    free: searchData.free || undefined,
  })
    .then((res) => {
      paginationData.total = res.data.total
      roomData.value = res.data.list
    })
    .catch(() => {
      roomData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}


const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  buildingId: "1",
  roomNum: "",
  free: "",
})

const resetSearch = () => {
  // searchFormRef.value?.resetFields();
  for (let key in searchData) {
    formData[key] = ""  
  }
  handleSearch()
}


const statusFormat = (row, column) => {
  if (row.free === 1) {
    return '空置'
  } else if (row.free === 0) {
    return '已出租'
  } else {
    return ''
  }  
}

function showRed(row) {
  if (row.row.free === 1) {
    return {
      color: "red",
    };
  }
}

interface SummaryMethodProps<T = GetRoomData> {
  columns: TableColumnCtx<T>[]
  data: T[]
}

const getSummaries = (param: SummaryMethodProps) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '总'
      return
    }

    if (column.property !== 'rent') {
      return
    }

    const values = data.map((row) => {
      if (row['free'] === 1) {
        return 0
      } else {
        return Number(row[column.property])
      }
    })

    if (!values.every((value) => Number.isNaN(value))) {
      sums[index] = `￥ ${values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!Number.isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)}`
    } else {
      sums[index] = 'N/A'
    }
  })

  return sums
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getRoomData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="楼栋">
          <el-select v-model="searchData.buildingId" placeholder="请选择">
            <el-option
              v-for="item in buildingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="phone" label="房间号">
          <el-input v-model="searchData.roomNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="free" label="状态">
          <el-select v-model="searchData.free" clearable placeholder="请选择">
              <el-option
                v-for="item in freeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>      
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="roomDialogVisible = true">新增房间</el-button>
          <el-button type="warning" color="#626aef" @click="handleCreateAllBill">创建租户账单</el-button>
          <el-button type="danger" :icon="Delete">批量删除</el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getRoomData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :row-style="showRed" :data="roomData" stripe
            :summary-method="getSummaries"
            show-summary>
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="roomNum" label="房间号" align="center" />
          <el-table-column prop="checkInDate" label="入住时间" align="center"/>
          <el-table-column prop="rent" label="月租金" align="center"/>
          <el-table-column prop="pledge" label="押金" align="center"/>
          <el-table-column prop="tenantName" label="租户" align="center"/>
          <el-table-column prop="tenantPhone" label="手机" align="center"/>
          <el-table-column prop="roomSize" label="面积" align="center"/>
          <el-table-column prop="free" label="状态" align="center" :formatter="statusFormat">   
          </el-table-column>

          <el-table-column fixed="right" label="操作" width="240" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="primary" v-if="scope.row.free == 1" text bg size="small" @click="handleAddBill(scope.row)">出租</el-button>
              <el-button type="primary" v-if="scope.row.free == 0" text bg size="small" @click="handleQuit(scope.row)">退租</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改房间 -->
    <el-dialog
      v-model="roomDialogVisible"
      :title="currentUpdateId === undefined ? '新增房间' : '修改房间'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="formData.roomNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="roomSize" label="面积">
          <el-input v-model="formData.roomSize" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="rent" label="月租金">
          <el-input v-model="formData.rent" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="tenantName" label="租户姓名" >
          <el-input v-model="formData.tenantName" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="tenantPhone" label="租户手机">
          <el-input v-model="formData.tenantPhone" placeholder="请输入" />
        </el-form-item>

        <el-form-item prop="checkInDate" label="入住时间">
          <el-date-picker v-model="formData.checkInDate" 
            type="day" placeholder="选择日期" :default-value="new Date()">
          </el-date-picker>
        </el-form-item>

        <el-form-item prop="onRent" label="已出租">
          <el-switch v-model="formData.onRent" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="roomDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">提交</el-button>
      </template>
    </el-dialog>

    <!-- 生成账单 -->
    <el-dialog v-model="billDialogVisible"
      :title="'出租'"
      @close="resetBillForm"
      width="30%">
      <el-form ref="billFormRef" :model="billFormData" :rules="billRules" label-width="100px" label-position="left">
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="billFormData.roomNum" readonly="true"/>
        </el-form-item>
        <el-form-item prop="originalPledge" label="押金">
          <el-input v-model="billFormData.originalPledge"/>
        </el-form-item>
        <el-form-item prop="originalRent" label="租金" readonly="true">
          <el-input v-model="billFormData.originalRent" />
        </el-form-item>
        <el-form-item prop="brokerage" label="佣金">
          <el-input v-model="billFormData.brokerage" />
        </el-form-item>
        <el-form-item prop="totalRent" label="合计金额">
          <el-input v-model="billFormData.totalRent" />
        </el-form-item>
        <el-form-item prop="actualRent" label="实付金额">
          <el-input v-model="billFormData.actualRent" />
        </el-form-item>
        <el-form-item prop="tenantName" label="租户姓名" >
          <el-input v-model="billFormData.tenantName" />
        </el-form-item>
        <el-form-item prop="tenantPhone" label="租户手机">
          <el-input v-model="billFormData.tenantPhone" />
        </el-form-item>
        <el-form-item prop="free" label="状态">
          <el-select v-model="billFormData.free" clearable placeholder="请选择">
              <el-option
                v-for="item in freeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>   
        </el-form-item>

        <el-form-item prop="billMonth" label="入住时间">
          <el-date-picker v-model="billFormData.billMonth" 
            type="date" placeholder="选择日期" :default-value="new Date()">
          </el-date-picker>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="billDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateBill">生成账单</el-button>
      </template>
    </el-dialog>

    <!-- 退租 -->
    <el-dialog v-model="quitDialogVisible"
      :title="'退租'"
      @close="resetQuitForm"
      width="30%">
      <el-form ref="quitFormRef" :model="quitFormData" label-width="100px" label-position="left">
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="quitFormData.roomNum" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="tenantName" label="租户姓名" >
          <el-input v-model="quitFormData.tenantName" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="pledge" label="实付押金">
          <el-input v-model="quitFormData.actualPledge" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="returnRent" label="待缴纳水费" >
          <el-input v-model="quitFormData.coldWater"/>
        </el-form-item>
        <el-form-item prop="returnRent" label="待缴纳电费" >
          <el-input v-model="quitFormData.electric"/>
        </el-form-item>
        <el-form-item prop="returnPledge" label="退还押金">
          <el-input v-model="quitFormData.returnPledge"/>
        </el-form-item>
        <el-form-item prop="returnRent" label="退还租金" >
          <el-input v-model="quitFormData.returnRent"/>
        </el-form-item>
        <el-form-item prop="billMonth" label="时间">
          <el-date-picker v-model="quitFormData.billMonth" 
            type="date" placeholder="选择日期" :default-value="new Date()">
          </el-date-picker>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="quitDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuitBill">退租</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>


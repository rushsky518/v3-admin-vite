<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getRoomDataApi,createRoomDataApi,updateRoomDataApi } from "@/api/room"
import { type GetRoomData } from "@/api/room/types/room"
import { createBillDataApi, getPledgeDataApi } from "@/api/bill"
import { type GetBillData } from "@/api/bill/types/bill"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { nextTick } from "process"

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
  formData.roomNum = ""
  formData.roomSize = ""
  formData.rent = ""
  formData.pledge = ""
  formData.tenantName = ""
  formData.tenantPhone = ""
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
  billFormData.roomNum = ""
  billFormData.roomSize = ""
  billFormData.rent = ""
  billFormData.pledge = ""
  billFormData.month = ""
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
        createRoomDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getRoomData()
          })
          .finally(() => {
            roomDialogVisible.value = false
          })
      } else {
        if (formData.free == '0') {
          ElMessage.success("房间已经出租，无法修改")
          return
        }
        updateRoomDataApi({
          id: currentUpdateId.value,
          roomSize: formData.roomSize,
          rent: formData.rent,
          pledge: formData.pledge,
          tenantName: formData.tenantName,
          tenantPhone: formData.tenantPhone,
          free: formData.free
        })
          .then(() => {
            ElMessage.success("修改成功")
            getRoomData()
          })
          .finally(() => {
            roomDialogVisible.value = false
          })
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

// 创建账单
const handleCreateBill = () => {
  billFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
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
  formData.free = row.free.toString()
  roomDialogVisible.value = true
}

const handleAddBill = (row: GetRoomData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  billFormData.roomId = row.id
  billFormData.roomNum = row.roomNum
  billFormData.roomSize = row.roomSize
  billFormData.originalRent = row.rent
  billFormData.actualRent = row.rent
  billFormData.originalPledge = row.pledge
  billFormData.actualPledge = row.pledge
  billFormData.tenantName = row.tenantName
  billFormData.tenantPhone = row.tenantPhone
  billFormData.free = '0'
  billDialogVisible.value = true
}


const quitFormRef = ref<FormInstance | null>(null)

const quitFormData = reactive({
  roomNum: "",
  roomSize: "",
  rent: "",
  pledge: "",
  month: ""
})

const resetQuitForm = () => {
  currentUpdateId.value = undefined
  quitFormData.roomNum = ""
  quitFormData.roomSize = ""
  quitFormData.rent = ""
  quitFormData.pledge = ""
  quitFormData.month = ""
}

const handleQuit = (row: GetRoomData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  quitFormData.roomId = row.id
  quitFormData.roomNum = row.roomNum
  quitFormData.roomSize = row.roomSize
  quitFormData.originalRent = row.rent
  quitFormData.actualRent = row.rent
  handleGetBill()
  quitFormData.tenantName = row.tenantName
  quitFormData.tenantPhone = row.tenantPhone
  quitFormData.free = '0'
  quitDialogVisible.value = true
}

// 查询已付押金
const handleGetBill = () => {
  getPledgeDataApi({
    "roomId": quitFormData.roomId,
    "tenantPhone": quitFormData.tenantPhone
    }).then((res) => {
        if (res.data.list.length > 0) {
          quitFormData.actualPledge = res.data.list[0].actualPledge
        }
      })
      .finally(() => {
        //
      })
}

// 创建退租账单
const handleQuitBill = () => {
    createBillDataApi({
      "roomId": quitFormData.roomId,
      "roomSize": quitFormData.roomSize,
      "tenantName": quitFormData.tenantName,
      "tenantPhone": quitFormData.tenantPhone,
      "actualRent": quitFormData.actualRent,
      "actualPledge": quitFormData.actualPledge,
      "returnRent": quitFormData.returnRent,
      "returnPledge": quitFormData.returnPledge,
      "billMonth": quitFormData.billMonth,
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
  searchData.buildingId ='';
  searchData.roomNum ='';
  handleSearch()
}

const buildingOptions = [{
  value: '1',
  label: '深圳盐田'
}, {
  value: '2',
  label: '福田华强南'
}, {
  value: '3',
  label: '广州长隆'
}]

const freeOptions = [{
  value: '0',
  label: '已出租'
}, {
  value: '1',
  label: '空置'
}]

const statusFormat = (row, column) => {
  if (row.free === 1) {
    return '空置'
  } else if (row.free === 0) {
    return '已出租'
  } else {
    return ''
  }  
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
        <el-table :data="roomData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="roomNum" label="房间号" align="center" />
          <el-table-column prop="roomSize" label="面积" align="center"/>
          <el-table-column prop="rent" label="月租金" align="center"/>
          <el-table-column prop="pledge" label="押金" align="center"/>
          <el-table-column prop="tenantName" label="租户" align="center"/>
          <el-table-column prop="tenantPhone" label="手机" align="center"/>
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
        <el-form-item prop="pledge" label="押金">
          <el-input v-model="formData.pledge" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="tenantName" label="租户姓名" >
          <el-input v-model="formData.tenantName" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="tenantPhone" label="租户手机">
          <el-input v-model="formData.tenantPhone" placeholder="请输入" />
        </el-form-item>

      </el-form>

      <template #footer>
        <el-button @click="roomDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>

    <!-- 生成账单 -->
    <el-dialog v-model="billDialogVisible"
      :title="'新增账单'"
      @close="resetBillForm"
      width="30%">
      <el-form ref="billFormRef" :model="billFormData" :rules="billRules" label-width="100px" label-position="left">
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="billFormData.roomNum" readonly="true"/>
        </el-form-item>
        <el-form-item prop="roomSize" label="面积" >
          <el-input v-model="billFormData.roomSize" readonly="true" />
        </el-form-item>
        <el-form-item prop="originalRent" label="应付租金" readonly="true">
          <el-input v-model="billFormData.originalRent" />
        </el-form-item>
        <el-form-item prop="actualRent" label="实付租金">
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
        <el-form-item prop="originalPledge" label="应付押金">
          <el-input v-model="billFormData.originalPledge"/>
        </el-form-item>
        <el-form-item prop="actualPledge" label="实付押金">
          <el-input v-model="billFormData.actualPledge"/>
        </el-form-item>
        <el-form-item prop="month" label="时间">
          <el-date-picker v-model="billFormData.billMonth" 
            type="month" placeholder="选择月份" :default-value="new Date()">
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
      <el-form ref="quitFormRef" :model="quitFormData" :rules="billRules" label-width="100px" label-position="left">
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="quitFormData.roomNum" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="roomSize" label="面积" >
          <el-input v-model="quitFormData.roomSize" :readonly="true" />
        </el-form-item>
        <el-form-item prop="tenantName" label="租户姓名" >
          <el-input v-model="quitFormData.tenantName" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="tenantPhone" label="租户手机" >
          <el-input v-model="quitFormData.tenantPhone" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="actualRent" label="实付租金" >
          <el-input v-model="quitFormData.actualRent" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="returnRent" label="退还租金" >
          <el-input v-model="quitFormData.returnRent"/>
        </el-form-item>
        <el-form-item prop="pledge" label="实付押金">
          <el-input v-model="quitFormData.actualPledge" :readonly="true"/>
        </el-form-item>
        <el-form-item prop="returnPledge" label="退还押金">
          <el-input v-model="quitFormData.returnPledge"/>
        </el-form-item>
        <el-form-item prop="month" label="时间">
          <el-date-picker v-model="quitFormData.billMonth" 
            type="month" placeholder="选择月份" :default-value="new Date()">
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


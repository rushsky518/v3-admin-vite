<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {  updateBillDataApi, getBillDataApi } from "@/api/bill"
import { type GetBillData } from "@/api/bill/types/bill"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { format } from "date-fns"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)

const formData = reactive({
  id: "",
  roomId: "",
  actualRent: "",
  tenantName: "",
  tenantPhone: "",
  billMonth: ""
})

const formRules: FormRules = reactive({
  // username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  // password: [{ required: true, trigger: "blur", message: "请输入密码" }]
})

const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      updateBillDataApi({
        id: currentUpdateId.value,
        roomId: formData.roomId,
        actualRent: formData.actualRent,
        actualPledge: formData.actualPledge,
        billMonth: formData.billMonth
      })
        .then(() => {
          ElMessage.success("交款成功")
          getBillData()
        })
        .finally(() => {
          dialogVisible.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}

const resetForm = () => {
  currentUpdateId.value = undefined
  formData.username = ""
  formData.password = ""
}
//#endregion

//#region 删
const handleDelete = (row: GetBillData) => {
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const rentInput = ref<undefined | null>(null)
const handleUpdate = (row: GetBillData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  formData.roomId = row.roomId
  formData.buildingNum = row.buildingNum
  formData.roomNum = row.roomNum
  formData.roomSize = row.roomSize
  formData.originalRent = row.originalRent
  formData.originalPledge = row.originalPledge
  formData.coldWater = row.coldWater
  formData.electric = row.electric
  formData.totalRent = row.totalRent
  formData.actualRent = row.actualRent
  dialogVisible.value = true

  rentInput.focus();
}
//#endregion

//#region 查
const handleSearch = () => {
  paginationData.currentPage === 1 ? getBillData() : (paginationData.currentPage = 1)
}


const billData = ref<GetBillData[]>([])

const getBillData = () => {
  loading.value = true
  if (searchData.billMonth != null) {
    searchData.billMonth = format(searchData.billMonth, "yyyy-MM", "Asia/Shanghai")
  }
  getBillDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    roomNum: searchData.roomNum || undefined,
    billMonth: searchData.billMonth || undefined,
    status: searchData.status || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      billData.value = res.data.list
    })
    .catch(() => {
      billData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  status: "",
  roomNum: "",
  tenantName: ""
})

const statusOptions = [{
  value: '0',
  label: '已结清'
}, {
  value: '1',
  label: '有欠款'
}]

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getBillData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="账期" prop="billMonth">
          <el-date-picker
            v-model="searchData.billMonth"
            placeholder="请选择时间"
            type="month"
          />
        </el-form-item>

        <el-form-item prop="status" label="状态">
          <el-select v-model="searchData.status" clearable placeholder="请选择">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>      
        </el-form-item>
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="searchData.roomNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="tenantName" label="租户姓名">
          <el-input v-model="searchData.tenantName" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增楼栋</el-button>
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
        <el-table :data="billData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="buildingNum" label="楼栋号" align="center" />
          <el-table-column prop="roomNum" label="房间号" align="center" />
          <el-table-column prop="billMonth" label="账单日期" align="center"/>
          <el-table-column prop="totalRent" label="总计金额" align="center"/>
          <el-table-column prop="actualRent" label="已付金额" align="center"/>

          <el-table-column prop="originalPledge" label="应付押金" align="center"/>
          <el-table-column prop="originalRent" label="应付租金" align="center"/>
          <el-table-column prop="brokerage" label="佣金" align="center"/>
          <el-table-column prop="coldWater" label="水费" align="center"/>
          <el-table-column prop="electric" label="电费" align="center"/>
        
          <el-table-column prop="returnPledge" label="退还押金" align="center"/>
          <el-table-column prop="returnRent" label="退还租金" align="center"/>

          <el-table-column prop="debt" label="欠款" align="center">
            <template #default="scope">
              <span :class="{ 'red-color': scope.row.debt > 0 }">{{ scope.row.debt }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="tenantName" label="租户姓名" align="center"/>
          <el-table-column prop="tenantPhone" label="租户电话" align="center"/>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" v-if="scope.row.status == 1" text bg size="small" @click="handleUpdate(scope.row)">交款</el-button>
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
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'交款'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="buildingNum" label="楼栋号">
          <el-input v-model="formData.buildingNum" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="formData.roomNum" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="originalRent" label="应付押金">
          <el-input v-model="formData.originalPledge" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="originalRent" label="应付租金">
          <el-input v-model="formData.originalRent" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="coldWater" label="水费">
          <el-input v-model="formData.coldWater" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="electric" label="电费">
          <el-input v-model="formData.electric" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="totalRent" label="总计金额">
          <el-input v-model="formData.totalRent" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="actualRent" label="实付金额">
          <el-input v-model="formData.actualRent" ref="rentInput" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认付款</el-button>
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

.red-color {
  color: red;
}
</style>

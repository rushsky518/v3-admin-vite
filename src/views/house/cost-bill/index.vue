<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getCostBillDataApi } from "@/api/cost-bill"
import { type GetCostBillData } from "@/api/cost-bill/types/cost-bill"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"

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
  buildingNum: "",
  rooms: "",
  address: ""
})

const billDialogVisible = ref<boolean>(false)
const billFormRef = ref<FormInstance | null>(null)
const billFormData = reactive({
  buildingNum: "",
  water: "",
  electric: "",
  gas: "",
  rent: "",
  network: ""
})

const formRules: FormRules = reactive({
  // username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  // password: [{ required: true, trigger: "blur", message: "请输入密码" }]
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createBuildingDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getBuildingData()
          })
          .finally(() => {
            dialogVisible.value = false
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
          })
          .then(() => {
            updateBuildingDataApi({
              id: currentUpdateId.value,
              rooms: formData.rooms,
              address: formData.address,
              rent: formData.rent,
            }).then(() => {
                ElMessage.success("修改成功")
                getBuildingData()
              })
          })
          .catch(() => {
            ElMessage({
              type: '通知',
              message: '取消提交',
            })
          }) 
          .finally(() => {
			      dialogVisible.value = false
          })
      }
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}


const resetForm = () => {
  currentUpdateId.value = undefined

  for (let key in formData) {
    formData[key] = ""  
  }
}

const resetBillForm = () => {
  for (let key in formData) {
    billFormData[key] = ""  
  }
}
//#endregion

//#region 删
const handleDelete = (row: GetBuildingData) => {
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: GetBuildingData) => {
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  formData.buildingNum = row.buildingNum
  formData.rent = row.rent
  formData.rooms = row.rooms
  formData.address = row.address
  dialogVisible.value = true
}

const handleUpdateBill = (row: GetBuildingData) => {
  // 点击修改，表单赋初始的值
  billFormData.buildingId = row.id
  billFormData.buildingNum = row.buildingNum
  billFormData.address = row.address
  billFormData.rent = row.rent
  billDialogVisible.value = true
}

const handleCreateBill = () => {
  createCostBillDataApi(billFormData)
  .then(() => {
    ElMessage.success("新增成功")
  })
  .finally(() => {
    billDialogVisible.value = false
  })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getBuildingData() : (paginationData.currentPage = 1)
}


const costBillData = ref<GetCostBillData[]>([])

const getCostBillData = () => {
  loading.value = true
  getCostBillDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    buildingNum: searchData.buildingNum || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      costBillData.value = res.data.list
    })
    .catch(() => {
      costBillData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  buildingNum: ""
})

const resetSearch = () => {
  searchData.buildingNum = ""
  getCostBillData()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getCostBillData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="buildingNum" label="楼栋号">
          <el-input v-model="searchData.buildingNum" placeholder="请输入" />
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
        <el-table :data="costBillData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="buildingNum" label="楼栋号" align="center" />
          <el-table-column prop="billMonth" label="月份" align="center" />
          <el-table-column prop="total" label="总计" align="center" />
          <el-table-column prop="rent" label="租金成本" align="center" />
          <el-table-column prop="pledge" label="押金成本" align="center" />
          <el-table-column prop="management" label="管理费" align="center"/>
          <el-table-column prop="water" label="水费" align="center"/>
          <el-table-column prop="electric" label="电费" align="center"/>
          <el-table-column prop="network" label="网费" align="center"/>
          <el-table-column prop="gas" label="燃气费" align="center"/>
          <el-table-column fixed="right" label="操作" width="250" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="primary" text bg size="small" @click="handleUpdateBill(scope.row)">创建成本账单</el-button>
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
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增楼栋' : '修改楼栋'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="buildingNum" label="楼栋号">
          <el-input v-model="formData.buildingNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="rent" label="租金成本">
          <el-input v-model="formData.rent" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="rooms" label="房间数" >
          <el-input v-model="formData.rooms" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="address" label="地址">
          <el-input v-model="formData.address" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>

    <!-- 新增/修改 -->
    <el-dialog
      v-model="billDialogVisible"
      :title="'创建成本账单'"
      @close="resetBillForm"
      width="30%"
    >
      <el-form ref="billFormRef" :model="billFormData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="buildingNum" label="楼栋号">
          <el-input v-model="billFormData.buildingNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="address" label="地址">
          <el-input v-model="billFormData.address" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="pledge" label="押金">
          <el-input v-model="billFormData.pledge" placeholder="请输入" />
        </el-form-item>        
        <el-form-item prop="rent" label="租金成本">
          <el-input v-model="billFormData.rent" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="water" label="水费" >
          <el-input v-model="billFormData.water" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="electric" label="电费">
          <el-input v-model="billFormData.electric" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="network" label="网费">
          <el-input v-model="billFormData.network" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="gas" label="燃气">
          <el-input v-model="billFormData.gas" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="management" label="管理费">
          <el-input v-model="billFormData.management" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="billMonth" label="时间">
          <el-date-picker v-model="billFormData.billMonth" 
            type="month" placeholder="选择月份" :default-value="new Date()">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="billDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateBill">确认</el-button>
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

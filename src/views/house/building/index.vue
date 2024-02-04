<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {  getBuildingDataApi,createBuildingDataApi,updateBuildingDataApi } from "@/api/building"
import { type GetBuildingData } from "@/api/building/types/building"
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
        updateBuildingDataApi({
          id: currentUpdateId.value,
          rooms: formData.rooms,
          address: formData.address,
        })
          .then(() => {
            ElMessage.success("修改成功")
            getBuildingData()
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
  formData.username = ""
  formData.password = ""
}
//#endregion

//#region 删
const handleDelete = (row: GetBuildingData) => {
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: GetBuildingData) => {
}
//#endregion

//#region 查
const handleSearch = () => {
  paginationData.currentPage === 1 ? getBuildingData() : (paginationData.currentPage = 1)
}


const buildingData = ref<GetBuildingData[]>([])

const getBuildingData = () => {
  loading.value = true
  getBuildingDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    buildingNum: searchData.buildingNum || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      buildingData.value = res.data.list
    })
    .catch(() => {
      buildingData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  buildingNum: ""
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getBuildingData, { immediate: true })
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
        <el-table :data="buildingData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="buildingNum" label="楼栋号" align="center" />
          <el-table-column prop="rooms" label="房间数" align="center"/>
          <el-table-column prop="address" label="地址" align="center"/>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
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
        <el-form-item prop="rooms" label="房间数" v-if="currentUpdateId === undefined">
          <el-input v-model="formData.rooms" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="address" label="地址" v-if="currentUpdateId === undefined">
          <el-input v-model="formData.address" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
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

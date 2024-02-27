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
  // 点击修改，表单赋初始的值
  currentUpdateId.value = row.id
  formData.buildingNum = row.buildingNum
  formData.rooms = row.rooms
  formData.address = row.address
  dialogVisible.value = true
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

// 时间轴数据
const getActivities = ((category) => {
  console.log(category);
  return [
          {
            content: '18 度',
            time: '2018-02-04',
          },
          {
            content: '28 度',
            time: '2018-03-03',
          },
          {
            content: '100 度',
            time: '2018-04-03',
          },
          {
            content: '120 度',
            time: '2018-05-03',
          }
        ]
});


</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="buildingNum" label="楼栋号">
          <el-input v-model="searchData.buildingNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="buildingNum" label="房间号">
          <el-input v-model="searchData.buildingNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="buildingNum" label="类型">
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
          <el-table-column prop="buildingNum" label="楼栋号" width="100" align="center" />
  
          <el-table-column label="操作" align="center" scope>
            <template #default="scope">
              <div class="processBox">
                <div class="timelineProcessBox">
                  <el-timeline class="timeline">
                    <el-timeline-item
                      class="lineitem"
                      :class="'active'"
                      v-for="activity in getActivities(scope.row.buildingNum)"
                      :timestamp="activity.time"
                    >
                      <span style="display: flex; flex-direction: column">
                        <span style="margin: 10px 0; font-size: 16px">
                          {{ activity.content }}
                        </span>
                      </span>
                    </el-timeline-item>
                  </el-timeline>
                
              </div>
            </div>
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
  margin-bottom: 20px;}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}



.processBox {
  background-color: #fff;
  height: 210px;
 
  .title {
    font-size: 16px;
    font-weight: 600;
    padding-left: 32px;
    padding-top: 16px;
  }
  .timelineProcessBox {
    .timeline {
      display: flex;
      width: 95%;
      margin: 40px auto;
      .lineitem {
        transform: translateX(50%);
        width: 25%;
      }
    }
  }
}
 
:deep(.el-timeline-item__tail) {
  border-left: none;
  border-top: 2px solid #e4e7ed;
  width: 100%;
  position: absolute;
  top: 6px;
}
:deep(.el-timeline-item__wrapper) {
  padding-left: 0;
  position: absolute;
  top: 20px;
  transform: translateX(-50%);
  text-align: center;
}
:deep(.el-timeline-item__timestamp) {
  font-size: 14px;
}
.active {
  :deep(.el-timeline-item__node) {
    background-color: #67C23A;
  }
  :deep(.el-timeline-item__tail) {
    border-color: #409EFF;
  }
}


</style>

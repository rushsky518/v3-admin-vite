<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {  createResourceDataApi, getResourceDataApi, updateResourceDataApi } from "@/api/resource"
import { type GetResourceData } from "@/api/resource/types/resource"
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
  buildingNum: "",
  rooms: "",
  address: ""
})
const formRules: FormRules = reactive({
  // username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  // password: [{ required: true, trigger: "blur", message: "请输入密码" }]
})

const timeZone = "Asia/Shanghai"

const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      // 日期格式化
      formData.valueMonth = format(formData.valueMonth, "yyyy-MM-dd", timeZone)

      createResourceDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getResourceData()
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
  formData.buildingId = ""
  formData.roomNum = ""
  formData.valueMonth = ""
  formData.amount = ""
  formData.type = ""
}
//#endregion

//#region 删
const handleDelete = (row: GetResourceData) => {
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: GetResourceData) => {
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
  paginationData.currentPage === 1 ? getResourceData() : (paginationData.currentPage = 1)
}


const resourceData = ref<GetResourceData[]>([])

const getResourceData = () => {
  loading.value = true
  getResourceDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    type: 1
  })
    .then((res) => {
      paginationData.total = res.data.total
      resourceData.value = res.data.list
    })
    .catch(() => {
      resourceData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  type: "1"
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getResourceData, { immediate: true })

// 时间轴数据
const getActivities = ((row: GetResourceData) => {
  return row.activities;
});


const typeOptions = [{
  value: '1',
  label: '冷水'
}, {
  value: '2',
  label: '热水'
}, {
  value: '3',
  label: '电'
}]

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

</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="type" label="类型">
          <el-select v-model="searchData.type" placeholder="请选择" >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增（水 电）示数</el-button>
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
        <el-table :data="resourceData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="roomId" label="房间号" width="100" align="center" />
  
          <el-table-column label="表示数" align="center" scope>
            <template #default="scope">
              <div class="processBox">
                <div class="timelineProcessBox">
                  <el-timeline class="timeline">
                    <el-timeline-item
                      class="lineitem"
                      :class="'active'"
                      v-for="activity in getActivities(scope.row)"
                      :timestamp="activity.valueMonth"
                    >
                      <span style="display: flex; flex-direction: column">
                        <span style="margin: 10px 0; font-size: 16px">
                          {{ activity.amount }}
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
      :title="'新增（水电）示数'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="buildingId" label="楼栋">
          <el-select v-model="formData.buildingId" placeholder="请选择" >
            <el-option
              v-for="item in buildingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="formData.roomNum" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="valueMonth" label="时间" >
          <el-date-picker v-model="formData.valueMonth" type="month" placeholder="请选择时间"/>
        </el-form-item>
        <el-form-item prop="amount" label="示数">
          <el-input v-model="formData.amount" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="类型">
          <el-select v-model="formData.type" placeholder="请选择" >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
  height: 100px;
 
  .title {
    font-size: 16px;
    font-weight: 600;
    padding-left: 32px;
    padding-top: 16px;
  }
  .timelineProcessBox {
    .timeline {
      display: flex;
      width: 100%;
      margin: 10px auto;
      .lineitem {
        transform: translateX(10%);
        width: 10%;
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
  top: 15px;
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

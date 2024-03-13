<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {  createResourceDataApi, getResourceDataApi, updateResourceDataApi } from "@/api/resource"
import { type GetResourceData } from "@/api/resource/types/resource"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { format } from "date-fns"
import { typeOptions, buildingOptions } from "@/views/house/common"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const insertDialogVisible = ref<boolean>(false)
const updateDialogVisible = ref<boolean>(false)
const insertFormRef = ref<FormInstance | null>(null)
const updateFormRef = ref<FormInstance | null>(null)

const insertFormData = reactive({
  type: "",
  buildingNum: "",
  valueMonth: "",
  list:[{      
      key: 0,
      roomNum:'',
      amount:''
    }]
})

const updateFormData = reactive({
  type: "",
  buildingId: "",
  valueMonth: "",    
  roomNum:'',
  amount:''
})


const formRules: FormRules = reactive({
  // username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
  // password: [{ required: true, trigger: "blur", message: "请输入密码" }]
})

const timeZone = "Asia/Shanghai"

const handleCreate = () => {
  insertFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      // 日期格式化
      insertFormData.valueMonth = format(insertFormData.valueMonth, "yyyy-MM-dd", timeZone)

      createResourceDataApi(insertFormData)
          .then(() => {
            ElMessage.success("新增成功")
            getResourceData()
          })
          .finally(() => {
            insertDialogVisible.value = false
          })
    } else {
      console.error("表单校验不通过", fields)
    }
  })

}

const resetForm = () => {
  insertFormData.buildingId = ""
  insertFormData.valueMonth = ""
  insertFormData.type = ""
  insertFormData.list= [{      
      key: 0,
      roomNum:'',
      amount:''
    }]
}

const resetUpdateForm = () => {
  updateFormData.roomId = ""
  updateFormData.roomNum = ""
  updateFormData.amount = ""
  updateFormData.valueMonth = ""
}

//#region 删
const handleDelete = (row: GetResourceData) => {
}
//#endregion

//#region 改

const handleUpdate = (row: GetResourceData) => {
  updateDialogVisible.value = Boolean(true)
  updateFormData.roomId = row.roomId
  updateFormData.type = String(row.type)
  updateFormData.buildingId = String(row.buildingId)
  updateFormData.roomNum = row.roomNum
  // 取出最新的示数
  if (row.activities.length > 0) {
    const elem = row.activities[row.activities.length - 1]
    updateFormData.valueMonth = elem.valueMonth
    updateFormData.amount = elem.amount
  }
}

const handleUpdateReq = () => {
    // 日期格式化
    updateFormData.valueMonth = format(updateFormData.valueMonth, "yyyy-MM-dd", timeZone)

    updateResourceDataApi(updateFormData)
        .then(() => {
          ElMessage.success("修改成功")
          getResourceData()
        })
        .finally(() => {
          updateDialogVisible.value = false
        })

}

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
    type: searchData.type,
    buildingId: searchData.buildingId,
    roomNum: searchData.roomNum
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
  type: "1",
  buildingId: undefined,
  roomNum: undefined
})

const resetSearch = () => {
  searchData.type = "1"
  searchData.buildingId = undefined
  searchData.roomNum = undefined
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getResourceData, { immediate: true })

// 时间轴数据
const getActivities = (row: GetResourceData) => {
  return row.activities;
}


const addRow = () => {
  let index = insertFormData.list.length;
  insertFormData.list.push({
    key: index,
    roomNum:'',
    amount:''
  });
}

const deleteRow = (index: number) => {
  insertFormData.list.splice(index, 1)
}

const typeFormat = (row, column) => {
  if (row.type === 1) {
    return '冷水'
  } else if (row.type === 2) {
    return '热水'
  } else {
    return '电'
  }  
}


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

        <el-form-item prop="buildingId" label="楼栋">
          <el-select v-model="searchData.buildingId" placeholder="请选择" clearable>
            <el-option
              v-for="item in buildingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="searchData.roomNum" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="insertDialogVisible = true">新增（水 电）示数</el-button>
          <el-button type="danger" :icon="Delete">批量删除</el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getResourceData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="resourceData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="roomId" label="房间 id" width="100" align="center" v-if="false"/>
          <el-table-column prop="roomNum" label="房间号" width="100" align="center" />
          <el-table-column prop="type" label="类型" width="100" align="center" :formatter="typeFormat"/>
  
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
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
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
    <!-- 新增 -->
    <el-dialog
      v-model="insertDialogVisible"
      :title="'新增（水电）示数'"
      @close="resetForm"
      width="40%"
    >
      <el-form ref="insertFormRef" :model="insertFormData" :rules="formRules" label-width="auto" label-position="left">
        <el-form-item prop="type" label="类型">
            <el-select v-model="insertFormData.type" placeholder="请选择" >
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="buildingId" label="楼栋">
            <el-select v-model="insertFormData.buildingId" placeholder="请选择" >
              <el-option
                v-for="item in buildingOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item prop="valueMonth" label="时间" >
            <el-date-picker v-model="insertFormData.valueMonth" type="day" placeholder="请选择时间"/>
          </el-form-item>

          <el-button @click="addRow">新增一行</el-button>
          <el-table :data="insertFormData.list" border stripe 
            :header-cell-style="{ 'text-align': 'center' }"
            :cell-style="{ 'text-align': 'center' }">
            <el-table-column type="index" label="序号"/>

            <el-table-column label="房间号">
              <template #default="scope">
                <el-form-item :prop="scope.$index + '.roomNum'" >
                  <el-input v-model="insertFormData.list[scope.$index].roomNum" ></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="示数">
              <template #default="scope">
                <el-form-item :prop="scope.$index + '.amount'">
                  <el-input v-model="insertFormData.list[scope.$index].amount" ></el-input>
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="danger" text bg size="small" @click="deleteRow(scope.$index)">删除</el-button>
              </template>
          </el-table-column>
          </el-table>
      </el-form>
      
      <template #footer>
        <el-button @click="insertDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="updateDialogVisible"
      :title="'修改（水电）示数'"
      @close="resetUpdateForm"
      width="40%"
    >
      <el-form ref="updateFormRef" :model="updateFormData" :rules="formRules" label-width="auto" label-position="left">
        
        <el-form-item prop="type" label="类型">
          <el-select v-model="updateFormData.type" placeholder="请选择" :disabled="true">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item prop="buildingId" label="楼栋">
          <el-select v-model="updateFormData.buildingId" placeholder="请选择" :disabled="true">
              <el-option
                v-for="item in buildingOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item prop="roomNum" label="房间号">
          <el-input v-model="updateFormData.roomNum" placeholder="请输入" readonly="true" />
        </el-form-item>
        <el-form-item prop="amount" label="示数">
          <el-input v-model="updateFormData.amount" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="valueMonth" label="时间" >
          <el-date-picker v-model="updateFormData.valueMonth" type="day" placeholder="请选择时间"/>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleUpdateReq">确认</el-button>
        <el-button @click="updateDialogVisible = false">取消</el-button>
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

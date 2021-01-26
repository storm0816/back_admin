<template>
  <div class="app-container">
    <!-- 条件查询 -->
    <el-form :inline="true" :model="query" size="mini">
      <el-form-item label="查询条件">
        <el-select v-model="query.select" clearable filterable style="width: 100px" @change="inputToDisabled" @clear="defaultinputToDisabled">
          <el-option
            v-for="item in queryOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model.trim="query.name" :disabled="disabledInput" />
      </el-form-item>

      <el-form-item label="状态：">
        <el-select v-model="query.status" clearable filterable style="width: 85px">
          <el-option
            v-for="item in statusOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称：">
        <el-select v-model="query.itemId" clearable filterable>
          <el-option
            v-for="item in itemList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
        <el-button icon="el-icon-refresh" @click="reload">重置</el-button>
        <el-button icon="el-icon-circle-plus-outline" type="primary" @click="openAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <!-- stripe 带斑马纹 -->
    <el-table
      :data="list"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column align="center" type="index" label="序号" width="60" />
      <el-table-column align="center" prop="hostname" label="设备名称" />
      <el-table-column align="center" prop="lanip" label="内网IP" />
      <el-table-column align="center" prop="wanip" label="外网IP" />
      <el-table-column align="center" prop="functionIds" label="功能列表" width="200">
        <template slot-scope="scope">
          <el-cascader
            v-model="scope.row.functionIds"
            disabled
            :options="functionOptions"
            style="display: block"
            :props="{multiple: true, emitPath: false, children: 'functionList', value: 'id', label: 'name'}"
            clearable
          />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="status" label="状态">
        <template slot-scope="scope">
          <!--  0: 已删除, 1:待下架，2:正常 3: 空闲-->
          <el-tag v-if="scope.row.status === 0" type="danger">已删除</el-tag>
          <el-tag v-if="scope.row.status === 1">待下架</el-tag>
          <el-tag v-if="scope.row.status === 2" type="success">正常</el-tag>
          <el-tag v-if="scope.row.status === 3" type="warning">空闲</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="updateDate" label="最后更新时间" min-width="90px">
        <template slot-scope="scope">
          {{ getFormat(scope.row.updateDate) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="handleEdit(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="page.current"
      :page-sizes="[10, 20, 50]"
      :page-size="page.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="page.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <edit :title="edit.title" :visible="edit.visible" :item-list="itemList" :function-options="functionOptions" :form-data="edit.formData" :remote-close="remoteClose" />
  </div>
</template>

<script>
import api from '@/api/asset'
import itemApi from '@/api/item'

import Edit from './edit'

// 格式化日期
import { format } from '@/utils/date'

const statusOptions = [
  { code: 0, name: '已删除' },
  { code: 1, name: '待下架' },
  { code: 2, name: '正常' },
  { code: 3, name: '空闲' }
]

const queryOptions = [
  { code: 1, name: '设备名称' },
  { code: 2, name: '内网IP' },
  { code: 3, name: '外网IP' }
]

export default {
  name: 'Asset', // 和对应路由表中配置的name值一致
  components: {
    Edit // Edit: Edit
  },

  data() {
    return {
      list: [], // 列表数据
      itemList: [],

      functionOptions: [], // 渲染分类标签级联下拉框

      page: { // 分页对象
        current: 1, // 当前页码
        size: 20, // 每页显示多少条
        total: 0 // 总记录数
      },

      disabledInput: true,

      query: {}, // 查询条件
      statusOptions, // 状态下拉框数组 statusOptions: statusOptions
      queryOptions, // 状态下拉框数组 queryOptions: queryOptions
      edit: {
        title: '',
        visible: false,
        formData: {}
      }
    }
  },

  created() {
    this.fetchData()
    this.getItemList()
    this.getFunctionOptions()
    // this.query.select = this.queryOptions[1].name // 设置默认查询条件
  },

  methods: {
    fetchData() {
      api.getList(this.query, this.page.current, this.page.size).then(response => {
        // console.log('response', response)
        // 列表数据
        this.list = response.data.records
        this.page.total = response.data.total
      })
    },

    // 组件模板中调用此方法格式化日期
    getFormat(date) {
      return format(date)
    },

    getItemList() {
      itemApi.getNormalList().then(response => {
        this.itemList = response.data
        // console.log('this.itemList ', this.itemList )
      })
    },

    inputToDisabled() {
      this.disabledInput = false
      this.query.name = ''
    },

    defaultinputToDisabled() {
      this.disabledInput = true
      this.query.name = ''
    },

    async getFunctionOptions() {
      const { data } = await itemApi.getItemAndFunction()
      this.functionOptions = data

      // console.log('this.functionOptions', this.functionOptions)
    },

    handleEdit(id) {
      // 通过id查询详情
      api.getById(id).then(response => {
        if (response.code === 20000) {
          // 将查询的详情传递
          this.edit.formData = response.data
          this.edit.title = '编辑'
          this.edit.visible = true
        }
      })
    },

    handleDelete(id) {
      this.$confirm('确认删除这条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 发送删除请求
        api.deleteById(id).then(response => {
          // 处理响应结果提示
          this.$message({
            type: response.code === 20000 ? 'success' : 'error',
            message: response.message
          })
          // 刷新列表数据
          this.fetchData()
        })
      }).catch(() => {
        // 取消删除，不用理会
      })
    },

    // val 是切换之后的每页显示多少条
    handleSizeChange(val) {
      this.page.size = val
      this.fetchData()
    },

    // 当页码改变后触发到此方法，val 是当前点击（或输入）的那个页码，
    handleCurrentChange(val) {
      this.page.current = val
      this.fetchData()
    },

    // 条件查询
    queryData() {
      // 将页码变为1，第1页
      this.page.current = 1
      this.fetchData()
    },
    // 重置
    reload() {
      this.query = {}
      this.fetchData()
    },
    // 子组件会触发此事件方法来关闭窗口
    remoteClose() {
      this.edit.formData = {}
      this.edit.visible = false
      this.fetchData()
    },
    // 打开新增窗口
    openAdd() {
      this.edit.visible = true
      this.edit.title = '新增'
    }
  }
}
</script>
